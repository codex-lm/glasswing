import {View} from '../src/render/scene.js';
import {entity} from '../src/core/entity.js';
import {testLevel} from '../src/data/test-level.js';
import {t} from '../src/ui/i18n.js';
const v=new View(document.querySelector('#world'));v.setLevel(testLevel);const players=Array.from({length:20},(_,i)=>entity(i,['brawler','skimmer','spark'][i%3],2+i%10*1.5,1+Math.floor(i/10)*2,i%2));const s={players,enemies:[],frame:0,camera:{x:9,y:5}};let last=0,frames=0,elapsed=0;function frame(now){const dt=last?(now-last)/1000:1/60;last=now;s.frame++;for(const p of players)p.clip='run';v.render(s,1,dt);frames++;elapsed+=dt;if(frames%60===0)document.querySelector('#hud').innerHTML=`<div class="hudbox"><h3>${t('diagnostics')}</h3><output id="metrics">${JSON.stringify({characters:20,fps:Math.round(frames/elapsed*10)/10,drawCalls:v.stats.calls,triangles:v.stats.triangles,frames})}</output></div>`;requestAnimationFrame(frame);}requestAnimationFrame(frame);
