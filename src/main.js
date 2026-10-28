import {t} from './ui/i18n.js';
import {View} from './render/scene.js';
import {Input,B} from './core/input.js';
import {testLevel} from './data/test-level.js';
import {loadManifest} from './ui/assets.js';
import {Screens} from './ui/screens.js';
import {hud} from './ui/hud.js';
import {createRun,tick} from './game/run.js';
import {entity} from './core/entity.js';
import {EYES} from './data/feel.js';
const view=new View(document.querySelector('#world')),input=new Input(),screens=new Screens(document.querySelector('#ui'));let state=createRun([testLevel]),paused=false;view.setLevel(state.level);loadManifest();
function title(){paused=false;state=createRun([testLevel]);state.players[0].x=13;state.players[0].px=13;state.players[0].y=1;state.players[0].py=1;view.setLevel(state.level);document.querySelector('#hud').innerHTML='';document.querySelector('#glass-border').className='';screens.title({play:select,twoPlayers:()=>screens.simple('twoPlayers',t('pendingTwo'),title),options:()=>screens.simple('options',t('pendingOptions'),title),howto:()=>screens.simple('howto',t('controls'),title)},!view.available);}
function select(){screens.show('select',`<section class="panel"><div class="eyebrow">${t('choose')}</div><h2>${t('brawler')}</h2><div class="row">${EYES.map((c,i)=>`<button data-eye="${c}" aria-label="${i+1}" style="background:${c};width:42px;height:42px;padding:0"></button>`).join('')}</div><div class="buttons"><button class="primary" data-action="start">${t('start')}</button><button data-action="back">${t('back')}</button></div></section>`,{start,back:title});for(const b of document.querySelectorAll('[data-eye]'))b.onclick=()=>{state.config.eye=b.dataset.eye;};}
function start(){state=createRun([testLevel],state.config);const dummy=entity(100,'brawler',8,1,2);dummy.eye='#8C8C94';state.enemies.push(dummy);input.clear();view.setLevel(state.level);screens.clear();}
function pause(){paused=true;input.clear();screens.show('pause',`<section class="panel"><h2>${t('pause')}</h2><div class="buttons"><button data-action="resume">${t('resume')}</button><button data-action="home">${t('home')}</button></div></section>`,{resume:()=>{paused=false;screens.clear();input.clear();},home:title});}
window.addEventListener('keydown',e=>{if((e.code==='Escape'||e.code==='KeyP')&&screens.name==='playing')pause();});
let last=0,acc=0;function loop(time){const dt=Math.min(.1,(time-last)/1000||0);last=time;acc+=dt;let steps=0;while(acc>=1/60&&steps++<5){if(screens.name==='playing'&&!paused){const masks=[input.sample(0),0];if(masks[0]&B.pause)pause();else tick(state,masks);if(state.frame%6===0)hud(state);}else state.frame++;acc-=1/60;}if(steps>=5)acc=0;view.render(state,acc*60,dt);const menu=input.menu();if(screens.name!=='playing'&&menu){const controls=[...document.querySelectorAll('#ui button,#ui select,#ui input')];if(menu&3){screens.focus=(screens.focus+(menu&1?-1:1)+controls.length)%controls.length;controls[screens.focus]?.focus();}if(menu&4)controls[screens.focus]?.click();}requestAnimationFrame(loop);}title();requestAnimationFrame(loop);
