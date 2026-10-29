import {View} from '../src/render/scene.js';
import {entity} from '../src/core/entity.js';
import {testLevel} from '../src/data/test-level.js';
import {t} from '../src/ui/i18n.js';

const params=new URLSearchParams(location.search),pose=params.get('pose');
let level=testLevel;
if(['landing','canopy','hollow','nest'].includes(params.get('area'))) {
 const response=await fetch('../src/data/levels/'+params.get('area')+'.json');
 if(response.ok)level=await response.json();
}
const view=new View(document.querySelector('#world'));view.setLevel(level);
const count=pose==='air'?2:20;
const players=Array.from({length:count},(_,i)=>entity(i,['brawler','skimmer','spark'][i%3],2+i%10*1.5,1+Math.floor(i/10)*2,i%2));
if(pose==='air')for(let i=0;i<2;i++){const p=players[i];p.x=p.px=20+i*12;p.y=p.py=i?1:12;p.clip='jump';}
else for(const p of players) {
 p.grounded=true;p.clip=pose==='glass'?'glassidle':pose==='windup'?'telegraph':'run';
 if(pose==='glass'){p.mask=0;p.glass=true;}
 if(pose==='windup')p.ai='telegraph';
}
const state={players,enemies:[],frame:0,camera:{x:pose==='air'?26:9,y:5}};
let last=0,frames=0,elapsed=0;
function frame(now) {
 const delta=last?(now-last)/1000:1/60;last=now;state.frame++;
 view.render(state,1,delta);frames++;elapsed+=delta;
 if(frames%60===0)document.querySelector('#hud').innerHTML=`<div class="hudbox"><h3>${t('diagnostics')}</h3><output id="metrics">${JSON.stringify({characters:count,fps:Math.round(frames/elapsed*10)/10,drawCalls:view.stats.calls,triangles:view.stats.triangles,frames})}</output></div>`;
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
