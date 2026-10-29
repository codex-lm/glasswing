import {entity,leadX,nearestLiving} from '../../core/entity.js';
import {physics,overlap} from '../../core/physics.js';
import {hurt,fire,heal,emit} from '../../core/combat.js';
import {random} from '../../core/rng.js';
import {ENEMIES,WILD as W} from '../../data/enemies.js';
import {WILD_HITBOX as H} from '../../data/moves.js';
import {UPGRADE_VALUES as U} from '../../data/upgrades.js';
import {F,DIFFICULTY,energyMax} from '../../data/feel.js';

// Sequential collision checks reuse this rectangle; hurt() never retains it.
const hit={x:0,y:0,w:0,h:0};

export function spawnEnemy(s,spawn){
 const e=entity(s.nextId++,spawn.kind,spawn.x,spawn.y||W.spawnY,2,s.config.difficulty);
 const d=ENEMIES[e.kind];
 e.hp=d.hp*(s.config.mode==='coop'?F.coopHP:1);
 e.eye='#8C8C94';e.eliteHits=spawn.elite?F.eliteHits:0;e.elite=!!spawn.elite;
 e.aiTimer=spawn.delay||0;e.wave=spawn.wave;e.homeY=e.y;e.dropped=false;
 s.enemies.push(e);
 return e;
}

export function enemyTick(s,e){
 if(e.boss)return;
 if(e.dead){
  if(!e.dropped){
   e.dropped=true;
   const type=random(s)<1/F.shardOdds?'shard':'energy';
   s.drops.push({active:true,type,x:e.x,y:Math.max(W.dropMinY,e.y+W.dropLift),life:F.dropLife});
  }
  return;
 }
 const target=nearestLiving(s.players,e.x);
 if(!target||Math.abs(e.x-s.camera.x)>F.activation)return;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(e.stun>0){
  e.stun--;e.vx*=W.friction;e.clip='hit';
  physics(e,s.level,{gravity:e.kind!=='skimmer'});
  return;
 }

 const d=ENEMIES[e.kind],dx=target.x-e.x,dist=Math.abs(dx);
 if(e.ai==='idle'){
  e.facing=dx<0?-1:1;e.clip='move';
  e.vx=e.kind==='spark'?(dist<d.retreatRange?-e.facing*d.speed:dist>d.approachRange?e.facing*d.speed:0):e.facing*d.speed;
  if(e.kind==='skimmer'){
   e.y+=(target.y+d.hoverHeight+Math.sin((s.frame+e.id*d.hoverPhase)*d.hoverFrequency)*d.hoverAmplitude-e.y)*d.hoverEase;
   e.vy=0;
  }
  if(e.aiTimer>0)e.aiTimer--;
  else if(dist<d.reach){
   e.ai='telegraph';e.charging=e.kind==='brawler'&&random(s)<d.chargeChance;
   e.aiTimer=e.charging?d.chargeTelegraph:d.telegraph;e.vx=0;
   e.aimX=target.x;e.aimY=target.y+W.aimHeight;s.audio='enemy-telegraph';
  }
 }else if(e.ai==='telegraph'){
  e.clip='telegraph';e.vx=0;
  if(--e.aiTimer<=0){
   e.ai='attack';e.aiTimer=d.active;e.hitIds.length=0;
   if(e.kind==='spark')fire(s,e,false,true);
  }
 }else if(e.ai==='attack'){
  e.clip='attack';e.vx=e.facing*(e.charging?d.chargeSpeed:d.speed);
  if(e.kind==='skimmer'){
   e.vx=Math.sign(e.aimX-e.x)*d.chargeSpeed;
   e.vy=Math.max(-d.diveMaxSpeed,Math.min(d.diveMaxSpeed,(e.aimY-e.y)*d.diveEase));
  }
  if(e.kind!=='spark'){
   hit.x=e.x+e.facing*H.forward;hit.y=e.y;hit.w=e.w+H.extraWidth;hit.h=e.h;
   for(const p of s.players){
    if(p.dead||e.hitIds.includes(p.id)||!overlap(hit,p))continue;
    e.hitIds.push(p.id);
    hurt(s,p,e,DIFFICULTY[s.config.difficulty].damage*(e.elite?F.eliteDamage:1));
   }
  }
  if(--e.aiTimer<=0){e.ai='recover';e.aiTimer=d.recovery;}
 }else{
  e.clip='idle';e.vx*=W.friction;
  if(e.kind==='skimmer'){e.vy=d.recoverRise;e.vx=-e.facing*d.speed;}
  if(--e.aiTimer<=0){e.ai='idle';e.aiTimer=0;}
 }
 physics(e,s.level,{gravity:e.kind!=='skimmer'});
 if(e.y<W.fallY){e.dead=true;e.defeatedFrame=s.frame;}
}

export function wavesTick(s){
 if(s.config.mode==='versus')return;
 const lead=leadX(s.players),waves=s.level.waves;
 for(let i=0;i<(waves?.length||0);i++){
  const w=waves[i];
  if(!s.lock&&!s.spawned.includes(i)&&lead>=w.trigger){
   s.spawned.push(i);
   for(let j=0;j<w.enemies.length;j++)spawnEnemy(s,{...w.enemies[j],delay:j*F.spawnDelay,wave:i});
   s.lock={wave:i,left:w.trigger-W.lockBehind,right:Math.min(s.level.width-W.edgeInset,w.trigger+W.lockAhead)};
   break;
  }
 }
 if(s.lock){
  let alive=false;
  for(const e of s.enemies)if(e.wave===s.lock.wave&&!e.dead){alive=true;break;}
  if(alive)for(const p of s.players)p.x=Math.max(s.lock.left,Math.min(s.lock.right,p.x));
  else s.lock=null;
 }
 for(const d of s.drops){
  if(!d.active)continue;
  if(--d.life<=0){d.active=false;continue;}
  for(const p of s.players){
   if(p.dead||Math.abs(p.x-d.x)>=F.collectRange||Math.abs(p.y+W.pickupHeight-d.y)>=W.pickupVertical)continue;
   if(d.type==='energy')p.energy=Math.min(energyMax(p),p.energy+W.energyPickup+(p.upgrades.includes('brightMotes')?U.brightMotes:0));
   else if(d.type==='shard')heal(p,W.shardRepair);
   else if(d.type==='mask')heal(p,p.maxMask);
   else if(d.type==='fragment')s.fragments++;
   d.active=false;emit(s,d.x,d.y,0xffd27c,5);s.audio='shard-pickup';break;
  }
 }
}

