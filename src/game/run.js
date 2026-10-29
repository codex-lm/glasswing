import {entity,remember,leadX} from '../core/entity.js';
import {hashSeed,random} from '../core/rng.js';
import {F,EYES,energyMax} from '../data/feel.js';
import {UPGRADES,EXTRA_UPGRADES,UPGRADE_VALUES as U} from '../data/upgrades.js';
import {VISUALS as V} from '../data/visuals.js';
import {RUN as R} from '../data/run.js';
import {B,edge} from '../core/input.js';
import {playerTick} from './player.js';
import {projectilesTick,heal,attackTick} from '../core/combat.js';
import {updateCamera} from '../core/camera.js';
import {enemyTick,wavesTick} from './enemies/wild.js';
import {spawnBoss,bossTick} from './boss.js';
import {versusFlow,arenaHazards,resetRound} from './versus.js';
import {coopTick} from './coop.js';
import {validateLevel} from './level.js';

const choiceKeys=[B.attack,B.sword,B.blast];
const noInput=[0,0];

export function createRun(levels,config={}){
 config={seed:'glasswing',kind:'brawler',difficulty:'normal',mode:'solo',rulesVersion:1,eye:EYES[0],kind2:'skimmer',eye2:EYES[1],arena:'arena-clearing',...config};
 // An editor level is the whole run, including one whose ID starts with arena-.
 if(config.customLevel)levels=[validateLevel(config.customLevel)];
 else levels=config.mode==='versus'?[levels.find(l=>l.id===config.arena)||levels[0]]:levels.filter(l=>!l.id.startsWith('arena-'));
 const s={
  config,seed:config.seed,rng:hashSeed(config.seed),frame:0,area:0,areasCleared:0,
  level:null,levels,levelRevision:0,
  players:[entity(1,config.kind,R.startX,R.introY,0,config.difficulty)],
  enemies:[],nextId:R.firstEnemyId,spawned:[],lock:null,fragments:0,
  offered:[],choices:[],altarPlayer:0,bonusUsed:false,bossStarted:false,
  projectiles:Array.from({length:F.projectilePool},()=>({active:false})),
  effects:Array.from({length:F.effectPool},()=>({life:0})),drops:[],
  camera:{x:F.cameraWidth/2,y:F.cameraHeight/2},hitStop:0,shake:0,
  lives:F.lives,phase:'playing',checkpoint:R.initialCheckpoint,log:[],audio:null,
  respawn:0,won:false,scores:[0,0],round:0,roundWinner:-1,winner:-1
 };
 s.players[0].eye=config.eye;
 if(config.mode!=='solo'){
  const p2=entity(2,config.kind2,R.partnerX,R.groundY,config.mode==='coop'?0:1,config.difficulty);
  p2.eye=config.eye2===config.eye?EYES[(EYES.indexOf(config.eye)+1)%EYES.length]:config.eye2;
  s.players.push(p2);
  if(config.mode==='coop')s.lives=F.coopLives;
 }
 enterArea(s,0);
 s.players[0].y=R.introY;s.players[0].py=R.introY;
 if(config.mode==='versus')resetRound(s);
 return s;
}

export function enterArea(s,index){
 s.area=index;s.level=structuredClone(s.levels[index]);s.levelRevision++;
 s.enemies=[];s.spawned=[];s.lock=null;s.bossStarted=false;
 s.checkpoint=s.level.checkpoints[0];
 s.drops=(s.level.secrets||[]).map(d=>({...d,active:true,life:Infinity}));
 for(const p of s.projectiles)p.active=false;
 s.camera.x=F.cameraWidth/2;
 for(const p of s.players){
  p.x=s.level.start.x;p.y=s.level.start.y;p.px=p.x;p.py=p.y;
  p.vx=0;p.vy=0;p.move=null;p.dead=false;p.prev=0;
 }
 s.phase='playing';
}

export function offer(s,bonus=false){
 s.choices=[];
 const pool=(s.config.rulesVersion>=3?UPGRADES.concat(EXTRA_UPGRADES):UPGRADES).filter(k=>!s.offered.includes(k));
 for(let i=0;i<R.upgradeChoices&&pool.length;i++){
  const index=Math.floor(random(s)*pool.length),key=pool.splice(index,1)[0];
  s.choices.push(key);s.offered.push(key);
 }
 s.phase=bonus?'bonus':'altar';s.altarPlayer=0;
 for(const p of s.players)p.prev=0;
 s.audio='altar-chime';
}

export function choose(s,index){
 const p=s.players[s.altarPlayer],key=s.choices[index];
 if(!key)return;
 p.upgrades.push(key);
 if(key==='hardenedMask')p.maxMask+=U.hardenedMask;
 heal(p,p.maxMask);p.energy=energyMax(p);s.altarPlayer++;
 if(s.altarPlayer<s.players.length)return;
 if(s.phase==='bonus'){s.bonusUsed=true;s.phase='playing';}
 else enterArea(s,s.area+1);
}

function respawn(s){
 for(const p of s.players){
  const old=p,fresh=entity(p.id,p.kind,s.checkpoint,R.respawnY,p.team,s.config.difficulty);
  Object.assign(p,fresh,{
   upgrades:old.upgrades,maxMask:old.maxMask,mask:old.maxMask,eye:old.eye,
   kills:old.kills,survived:old.survived,secondUsed:old.secondUsed,inv:F.invincible
  });
 }
 for(const p of s.projectiles)p.active=false;
 s.phase='playing';
}

function flow(s){
 if(s.config.mode==='versus'){versusFlow(s);return;}
 const lead=leadX(s.players);
 for(const c of s.level.checkpoints)if(lead>=c)s.checkpoint=Math.max(c,s.checkpoint);
 let allDead=true;
 for(const p of s.players){
  if(p.y<R.playerFallY){
   p.dead=true;p.defeatedFrame=s.frame;p.clip='beaten';
   if(s.config.mode==='coop'){
    while(p.x<s.level.width-R.edgeInset&&!s.level.grid[0][Math.floor(p.x)])p.x+=R.safeGroundStep;
    p.y=R.groundY;p.py=R.groundY;p.vy=0;
   }
  }
  if(!p.dead)allDead=false;
 }
 if(allDead){
  s.lives--;
  if(s.lives<=0){s.phase='result';s.won=false;s.audio='run-lost';}
  else{s.phase='respawn';s.respawn=F.respawn;}
  return;
 }
 if(s.fragments>=F.fragmentBonus&&!s.bonusUsed&&s.area===R.bonusArea){offer(s,true);return;}
 let enemyAlive=false,boss=null;
 for(const e of s.enemies){if(!e.dead)enemyAlive=true;if(e.boss&&!boss)boss=e;}
 const clear=s.spawned.length===(s.level.waves?.length||0)&&!enemyAlive;
 if(s.level.boss&&clear&&!s.bossStarted){spawnBoss(s);return;}
 if(s.bossStarted&&boss?.dead){
  s.areasCleared=R.forestAreas;s.won=true;s.phase='result';s.audio='run-win';return;
 }
 if(lead>=s.level.end&&clear&&!s.level.boss){
  s.areasCleared=s.area+1;
  if(s.area<s.levels.length-1)offer(s);
  else{s.won=true;s.phase='result';}
 }
}

// Snapshot both moves before either hit lands so simultaneous attacks still trade.
function versusAttacks(s){
 const a=s.players[0],b=s.players[1];
 const moveA=a.move,frameA=a.moveFrame,moveB=b.move,frameB=b.moveFrame;
 if(moveA){a.move=moveA;a.moveFrame=frameA;attackTick(s,a,s.players);if(a.dead)a.move=null;}
 if(moveB){b.move=moveB;b.moveFrame=frameB;attackTick(s,b,s.players);if(b.dead)b.move=null;}
}

export function tick(s,inputs=noInput){
 if(s.phase==='result')return;
 s.frame++;s.audio=null;
 const last=s.log.at(-1);
 if(last&&last[1]===inputs[0]&&last[2]===(inputs[1]||0))last[0]++;
 else s.log.push([1,inputs[0],inputs[1]||0]);

 if(s.phase==='round'){versusFlow(s);return;}
 if(s.phase==='respawn'){if(--s.respawn<=0)respawn(s);return;}
 if(s.phase==='altar'||s.phase==='bonus'){
  const p=s.players[s.altarPlayer],mask=inputs[s.altarPlayer]||0;
  for(let i=0;i<choiceKeys.length;i++)if(edge(mask,p.prev,choiceKeys[i])){choose(s,i);break;}
  p.prev=mask;return;
 }
 if(s.hitStop>0){s.hitStop--;return;}
 if(s.shake)s.shake--;
 for(const e of s.players)remember(e);
 for(const e of s.enemies)remember(e);
 const versus=s.config.mode==='versus';
 for(let i=0;i<s.players.length;i++)playerTick(s,s.players[i],inputs[i]||0,versus?s.players:s.enemies,!versus);
 if(versus)versusAttacks(s);
 for(const e of s.enemies)e.boss?bossTick(s,e):enemyTick(s,e);
 projectilesTick(s,s.players,s.enemies);
 wavesTick(s);
 if(versus)arenaHazards(s);
 if(s.config.mode==='coop')coopTick(s);
 flow(s);
 for(const e of s.effects)if(e.life>0){e.life--;e.x+=e.vx;e.y+=e.vy;e.vy-=V.effectGravity;}
 updateCamera(s.camera,s.players,s.level.width);
}

