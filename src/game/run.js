import {entity,remember} from '../core/entity.js';
import {hashSeed,random} from '../core/rng.js';
import {F} from '../data/feel.js';
import {UPGRADES} from '../data/upgrades.js';
import {B,edge} from '../core/input.js';
import {playerTick} from './player.js';
import {projectilesTick,heal} from '../core/combat.js';
import {updateCamera} from '../core/camera.js';
import {enemyTick,wavesTick} from './enemies/wild.js';
import {spawnBoss,bossTick} from './boss.js';
export function createRun(levels,config={}){
 config={seed:'glasswing',kind:'brawler',difficulty:'normal',mode:'solo',eye:'#FF8A3D',...config};
 const s={config,seed:config.seed,rng:hashSeed(config.seed),frame:0,area:0,areasCleared:0,level:null,levels,levelRevision:0,players:[entity(1,config.kind,3,5,0,config.difficulty)],enemies:[],nextId:100,spawned:[],lock:null,fragments:0,offered:[],choices:[],altarPlayer:0,bonusUsed:false,bossStarted:false,projectiles:Array.from({length:F.projectilePool},()=>({active:false})),effects:Array.from({length:F.effectPool},()=>({life:0})),drops:[],camera:{x:9,y:5},hitStop:0,shake:0,lives:F.lives,phase:'playing',checkpoint:2,log:[],audio:null,respawn:0,won:false};
 s.players[0].eye=config.eye;enterArea(s,0);s.players[0].y=5;s.players[0].py=5;return s;
}
export function enterArea(s,index){s.area=index;s.level=structuredClone(s.levels[index]);s.levelRevision++;s.enemies=[];s.spawned=[];s.lock=null;s.bossStarted=false;s.checkpoint=s.level.checkpoints[0];s.drops=(s.level.secrets||[]).map(d=>({...d,active:true,life:Infinity}));s.projectiles.forEach(p=>p.active=false);s.camera.x=9;for(const p of s.players){p.x=s.level.start.x;p.y=s.level.start.y;p.px=p.x;p.py=p.y;p.vx=0;p.vy=0;p.move=null;p.dead=false;p.prev=0;}s.phase='playing';}
export function offer(s,bonus=false){s.choices=[];const pool=UPGRADES.filter(k=>!s.offered.includes(k));for(let i=0;i<3&&pool.length;i++){const index=Math.floor(random(s)*pool.length);const key=pool.splice(index,1)[0];s.choices.push(key);s.offered.push(key);}s.phase=bonus?'bonus':'altar';s.altarPlayer=0;for(const p of s.players)p.prev=0;s.audio='altar-chime';}
export function choose(s,index){const p=s.players[s.altarPlayer],key=s.choices[index];if(!key)return;p.upgrades.push(key);if(key==='hardenedMask')p.maxMask++;heal(p,p.maxMask);p.energy=F.energy;s.altarPlayer++;if(s.altarPlayer<s.players.length)return;if(s.phase==='bonus'){s.bonusUsed=true;s.phase='playing';}else enterArea(s,s.area+1);}
function respawn(s){for(const p of s.players){const old=p;const fresh=entity(p.id,p.kind,s.checkpoint,2,p.team,s.config.difficulty);Object.assign(p,fresh,{upgrades:old.upgrades,maxMask:old.maxMask,mask:old.maxMask,eye:old.eye,kills:old.kills,survived:old.survived,secondUsed:old.secondUsed,inv:F.invincible});}s.projectiles.forEach(p=>p.active=false);s.phase='playing';}
function flow(s){const lead=Math.max(...s.players.map(p=>p.x));for(const c of s.level.checkpoints)if(lead>=c)s.checkpoint=Math.max(c,s.checkpoint);for(const p of s.players)if(p.y<-3){p.dead=true;p.defeatedFrame=s.frame;p.clip='beaten';}
 if(s.players.every(p=>p.dead)){s.lives--;if(s.lives<=0){s.phase='result';s.won=false;s.audio='run-lost';}else{s.phase='respawn';s.respawn=F.respawn;}return;}
 if(s.fragments>=F.fragmentBonus&&!s.bonusUsed&&s.area===3){offer(s,true);return;}
 const clear=s.spawned.length===(s.level.waves||[]).length&&!s.enemies.some(e=>!e.dead);
 if(s.level.boss&&s.spawned.length===(s.level.waves||[]).length&&!s.enemies.some(e=>!e.dead)&&!s.bossStarted){spawnBoss(s);return;}
 if(s.bossStarted&&s.enemies.find(e=>e.boss)?.dead){s.areasCleared=4;s.won=true;s.phase='result';s.audio='run-win';return;}
 if(lead>=s.level.end&&clear&&!s.level.boss){s.areasCleared=s.area+1;if(s.area<s.levels.length-1)offer(s);else{s.won=true;s.phase='result';}}
}
export function tick(s,inputs=[0,0]){
 if(s.phase==='result')return;s.frame++;s.audio=null;const last=s.log.at(-1);if(last&&last[1]===inputs[0]&&last[2]===(inputs[1]||0))last[0]++;else s.log.push([1,inputs[0],inputs[1]||0]);
 if(s.phase==='respawn'){if(--s.respawn<=0)respawn(s);return;}
 if(s.phase==='altar'||s.phase==='bonus'){const p=s.players[s.altarPlayer],mask=inputs[s.altarPlayer]||0;for(const [i,key] of [B.attack,B.sword,B.blast].entries())if(edge(mask,p.prev,key)){choose(s,i);break;}p.prev=mask;return;}
 if(s.hitStop>0){s.hitStop--;return;}if(s.shake)s.shake--;
 for(const e of s.players.concat(s.enemies))remember(e);
 for(let i=0;i<s.players.length;i++)playerTick(s,s.players[i],inputs[i]||0,s.enemies);
 for(const e of s.enemies)e.boss?bossTick(s,e):enemyTick(s,e);
 projectilesTick(s,s.players.concat(s.enemies));wavesTick(s);flow(s);
 for(const e of s.effects)if(e.life>0){e.life--;e.x+=e.vx;e.y+=e.vy;e.vy-=.005;}
 updateCamera(s.camera,s.players,s.level.width);
}
