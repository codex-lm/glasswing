import {emitSound} from './sound.js';
import {AUDIO} from '../data/audio.js?v=0.3.1';
import {F,DIFFICULTY,energyMax} from '../data/feel.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';
import {VISUALS as V} from '../data/visuals.js';
import {KINDS} from '../data/kinds.js';
import {MOVES} from '../data/moves.js';
import {overlap,tile,solid} from './physics.js';

// Synchronous collision resolution never retains these scratch records.
const hit={x:0,y:0,w:0,h:0};
const meleeImpact={stop:0,knock:0};
const orbImpact={projectile:null,impactX:0};
const defaultImpact={};
const noEntities=[];

export function emit(s,x,y,color=0xf1ece2,count=8){
 let slot=0;
 for(let i=0;i<count;i++){
  while(slot<s.effects.length&&s.effects[slot].life>0)slot++;
  if(slot===s.effects.length)break;
  const fx=s.effects[slot++],angle=i/count*Math.PI*2;
  fx.x=x;fx.y=y;fx.vx=Math.cos(angle)*V.effectSpeedX;fx.vy=Math.sin(angle)*V.effectSpeedY;
  fx.life=F.effectLife;fx.size=V.effectSize;fx.color=color;
 }
}

export function heal(e,amount){
 if(e.dead)return;
 const glass=e.glass;
 e.mask=Math.min(e.maxMask,e.mask+amount);e.glass=e.mask<=0;
 if(glass&&!e.glass)e.survived++;
}

export function hurt(s,target,source,damage=1,{projectile=null,stop=F.hitStop,knock=F.knockback,impactX=source.x}=defaultImpact){
 if(target.dead||target.inv>0||target.dodge>0)return 'immune';
 const front=(impactX-target.x)*target.facing>=0;
 if(target.blocking&&target.grounded&&front){
  if(target.blockAge<(target.glass?F.glassParry:F.parry)){
   target.energy=Math.min(energyMax(target),target.energy+F.parryEnergy);
   target.dodgeCd=0;target.parryFlash=F.parryStop;
   source.stun=F.stun;source.vulnerable=true;s.hitStop=F.parryStop;emitSound(s,'parry');
   emit(s,target.x,target.y+1,0xffffff,14);
   if(projectile){
    projectile.vx=-projectile.vx;projectile.team=target.team;projectile.owner=target.id;
    projectile.color=target.eye;projectile.hitIds.length=0;projectile.life=F.orbLifetime;
   }
   return 'parry';
  }
  if(target.energy>=F.blockCost){
   target.energy-=F.blockCost;target.knockback=-target.facing*F.knockback;
   target.knockFrames=F.knockFrames;emitSound(s,'block');
   return 'block';
  }
 }
 if(target.vulnerable){damage*=F.vulnerableDamage;target.vulnerable=false;}
 target.flash=F.flash;target.knockback=(target.x>=impactX?1:-1)*knock;target.knockFrames=F.knockFrames;
 s.hitStop=Math.max(s.hitStop,target.glass?F.glassStop:stop);s.shake=F.shakeFrames;
 emit(s,target.x,target.y+target.h*.5,source.eye||0xffffff);

 if(target.team===2){
  if(target.eliteHits>0)target.eliteHits--;else target.hp-=damage;
  if(target.boss){
   target.mask=target.hp;
   target.phase=target.hp>target.maxMask/2?1:target.hp>0?2:3;
   if(target.hp<=0&&!target.glass){
    target.glass=true;target.hp=1;target.inv=F.invincible;target.phase=3;
    target.stun=F.bossBreakWarning;target.ai='idle';target.aiTimer=0;s.hitStop=F.swordStop;
    emit(s,target.x,target.y+2,0xf1ece2,24);emitSound(s,'mask-shatter');
   }else if(target.glass&&target.hp<=0)target.dead=true;
  }else if(target.hp<=0)target.dead=true;
 }else{
  if(target.glass){
   if(target.upgrades.includes('secondMask')&&!target.secondUsed){
    target.secondUsed=true;heal(target,U.secondMask);
   }else target.dead=true;
  }else{
   target.mask=Math.max(0,target.mask-damage);
   if(target.mask<=0){
    target.glass=true;s.hitStop=F.swordStop;emitSound(s,'mask-shatter');
    emit(s,target.x,target.y+target.h*.8,0xf1ece2,24);
   }else{
    emitSound(s,'player-hit');
    emitSound(s,'mask-crack'+Math.min(AUDIO.maskCracks,Math.max(1,Math.ceil((1-target.mask/target.maxMask)*AUDIO.maskCracks))));
   }
  }
  target.inv=F.invincible;target.move=null;
 }
 if(target.dead){
  target.defeatedFrame=s.frame;target.clip='beaten';target.vx=0;target.vy=0;
  if(source.team!==2){
   source.kills++;
   if(source.upgrades.includes('patientMask')&&source.kills%U.patientKills===0)heal(source,U.patientRepair);
  }
  emitSound(s,target.team===2?'enemy-beaten':'player-hit');
 }
 return 'hit';
}

export function startMove(e,name){
 e.move=name;e.moveFrame=0;e.attackId++;e.hitIds.length=0;e.clip=name;
}

export function damageFor(e,stat){
 let value=KINDS[e.kind][stat];
 if((stat==='punch'||stat==='kick')&&e.upgrades.includes('heavyFists'))value+=U.heavyFists;
 return value*(e.glass?(e.upgrades.includes('glassHeart')?U.glassHeart:F.glassMultiplier):1);
}

// Return the first orb actually created so a boss can configure its own shot.
// If the pool is full, leave energy and existing projectiles untouched.
export function fire(s,e,charged=false,enemy=false){
 const k=KINDS[e.kind],cost=k.cost+(charged?F.chargeExtra:0);
 if(!enemy&&!e.glass&&e.energy<cost)return null;
 const count=e.upgrades.includes('twinOrb')?U.twinOrb:1;
 let first=null,slot=0;
 for(let i=0;i<count;i++){
  while(slot<s.projectiles.length&&s.projectiles[slot].active)slot++;
  if(slot===s.projectiles.length)break;
  const p=s.projectiles[slot++];
  if(!first){first=p;if(!enemy&&!e.glass)e.energy-=cost;}
  p.active=true;p.x=e.x+e.facing*F.orbForward;p.y=e.y+e.h*F.orbHeight+i*F.twinOrbSpacing;
  p.vx=e.facing*(enemy?F.enemyOrbSpeed:charged?F.chargedSpeed:F.orbSpeed);
  p.radius=charged?F.chargedRadius:F.orbRadius;
  p.damage=enemy?DIFFICULTY[s.config.difficulty].damage:damageFor(e,'blast')*(charged?F.chargeDamage:1);
  p.team=e.team;p.owner=e.id;p.life=F.orbLifetime;p.range=enemy?F.enemyOrbRange:k.range;
  p.travel=0;p.pierce=k.pierce;p.color=e.eye;
  if(!p.hitIds)p.hitIds=[];
  p.hitIds.length=0;
 }
 if(first)emitSound(s,'blast-fire');
 return first;
}

export function attackTick(s,e,targets){
 if(!e.move)return;
 const m=MOVES[e.move],speed=e.upgrades.includes('quickHands')?1/U.quickHands:1;
 const frame=Math.floor(e.moveFrame),box=m.frames[frame];
 if(m.stat!=='blast'&&e.moveFrame>=m.startup&&e.moveFrame-speed<m.startup)
  emitSound(s,m.stat==='sword'?'sword-swing':e.move);
 if((e.move==='blast'||e.move==='charge')&&frame>=m.startup&&!e.fired){
  fire(s,e,e.move==='charge');e.fired=true;
 }
 if(box&&m.stat!=='blast'){
  const reach=box.w+(m.stat==='sword'&&e.upgrades.includes('longerNeedle')?U.longerNeedle:0);
  hit.x=e.move==='downsword'?e.x:e.x+e.facing*(box.x+reach/2);
  hit.y=e.y+box.y;hit.w=reach;hit.h=box.h;
  for(const target of targets){
   if(target.team===e.team||e.hitIds.includes(target.id)||!overlap(hit,target))continue;
   e.hitIds.push(target.id);
   let dmg=damageFor(e,m.stat);
   if(target.team!==2)dmg/=F.playerDamageDivisor;
   meleeImpact.stop=e.glass?F.glassStop:box.stop;meleeImpact.knock=box.knock;
   const result=hurt(s,target,e,dmg,meleeImpact);
   if(result==='hit'){
    e.energy=Math.min(energyMax(e),e.energy+F.meleeEnergy);
    if(m.stat==='sword')e.jumps=0;
    if(e.move==='divekick'||e.move==='downsword'){
     e.vy=e.move==='downsword'?F.pogoSpeed:F.diveBounce;
     if(e.move==='downsword')emitSound(s,'pogo');
     if(e.upgrades.includes('pogoMaster')){
      e.vy*=U.pogoSpeed;e.energy=Math.min(energyMax(e),e.energy+U.pogoEnergy);
     }
    }
    if(m.stat==='kick'){
     target.vy=F.kickLaunch;
     if(e.upgrades.includes('shockKick'))target.stun=U.shockKick;
    }
    emitSound(s,m.stat==='sword'?'sword-hit':e.move);
   }
  }
  // Breakable walls use the same active-frame rectangle as enemies.
  for(let y=Math.max(0,Math.floor(hit.y));y<Math.min(s.level.grid.length,Math.ceil(hit.y+hit.h));y++){
   for(let x=Math.max(0,Math.floor(hit.x-hit.w/2));x<Math.min(s.level.width,Math.ceil(hit.x+hit.w/2));x++){
    if(s.level.grid[y][x]===4){
     s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);
    }
   }
  }
 }
 e.moveFrame+=speed;
 if(e.moveFrame>=m.total){e.move=null;e.fired=false;}
}

function ownerById(first,second,id){
 for(const e of first)if(e.id===id)return e;
 for(const e of second)if(e.id===id)return e;
 return null;
}

export function projectilesTick(s,entities,others=noEntities){
 for(const p of s.projectiles){
  if(!p.active)continue;
  p.x+=p.vx;p.travel+=Math.abs(p.vx);
  if(solid(tile(s.level,Math.floor(p.x),Math.floor(p.y)))){
   p.active=false;emit(s,p.x,p.y,p.color,4);emitSound(s,'blast-hit');continue;
  }
  if(--p.life<=0||p.travel>p.range){p.active=false;continue;}
  // Preserve player-then-enemy resolution order without a concatenated array.
  for(let i=0;i<entities.length+others.length;i++){
   const target=i<entities.length?entities[i]:others[i-entities.length];
   if(target.team===p.team||target.dead||p.hitIds.includes(target.id))continue;
   if(Math.abs(p.x-target.x)>target.w/2+p.radius||p.y+p.radius<target.y||p.y-p.radius>target.y+target.h)continue;
   const source=ownerById(entities,others,p.owner)||{x:p.x-p.vx,eye:p.color,team:p.team};
   const damage=target.team===2?p.damage:p.team===2?p.damage:p.damage/F.playerDamageDivisor;
   orbImpact.projectile=p;orbImpact.impactX=p.x-p.vx;
   const result=hurt(s,target,source,damage,orbImpact);
   if(result==='parry'){source.stun=F.stun;source.vulnerable=true;break;}
   if(result!=='immune'){
    emitSound(s,'blast-hit');
    p.hitIds.push(target.id);
    if(p.pierce>0)p.pierce--;else p.active=false;
    break;
   }
  }
 }
}
