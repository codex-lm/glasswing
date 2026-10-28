import {entity,remember} from '../core/entity.js';
import {hashSeed} from '../core/rng.js';
import {F} from '../data/feel.js';
import {playerTick} from './player.js';
import {projectilesTick} from '../core/combat.js';
import {updateCamera} from '../core/camera.js';
import {enemyTick,wavesTick} from './enemies/wild.js';
export function createRun(levels,config={}){config={seed:'glasswing',kind:'brawler',difficulty:'normal',mode:'solo',eye:'#FF8A3D',...config};const s={config,seed:config.seed,rng:hashSeed(config.seed),frame:0,area:0,level:structuredClone(levels[0]),levels,levelRevision:0,players:[entity(1,config.kind,3,5,0,config.difficulty)],enemies:[],nextId:100,spawned:[],lock:null,fragments:0,projectiles:Array.from({length:F.projectilePool},()=>({active:false})),effects:Array.from({length:F.effectPool},()=>({life:0})),drops:[],camera:{x:9,y:5},hitStop:0,shake:0,lives:F.lives,phase:'playing',checkpoint:2,log:[],audio:null};s.players[0].eye=config.eye;return s;}
export function tick(s,inputs=[0,0]){s.frame++;s.audio=null;if(s.phase!=='playing')return;const last=s.log.at(-1);if(last&&last[1]===inputs[0]&&last[2]===(inputs[1]||0))last[0]++;else s.log.push([1,inputs[0],inputs[1]||0]);if(s.hitStop>0){s.hitStop--;return;}if(s.shake)s.shake--;for(const e of s.players.concat(s.enemies))remember(e);for(let i=0;i<s.players.length;i++)playerTick(s,s.players[i],inputs[i]||0,s.enemies);for(const e of s.enemies)enemyTick(s,e);projectilesTick(s,s.players.concat(s.enemies));wavesTick(s);for(const e of s.effects)if(e.life>0){e.life--;e.x+=e.vx;e.y+=e.vy;e.vy-=.005;}updateCamera(s.camera,s.players,s.level.width);}
