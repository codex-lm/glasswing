import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {BOSS} from '../data/boss.js';
import {BOSS_HITBOX as H} from '../data/moves.js';
import {F,DIFFICULTY} from '../data/feel.js';
import {hurt,fire,emit} from '../core/combat.js';
import {physics} from '../core/physics.js';
import {spawnEnemy} from './enemies/wild.js';

export function spawnBoss(s){
 const e=entity(s.nextId++,'brawler',BOSS.spawnX,BOSS.spawnY,2,s.config.difficulty);
 const health=BOSS.hp*(s.config.mode==='coop'?F.coopHP:1);
 Object.assign(e,{
  boss:true,phase:1,hp:health,maxMask:health,mask:health,eye:'#19B8A6',
  w:e.w*F.bossSize,h:e.h*F.bossSize,ai:'idle',aiTimer:BOSS.entranceDelay,sequence:0
 });
 s.enemies.push(e);s.bossStarted=true;emitSound(s,'boss-roar');
 return e;
}

export function bossTick(s,e){
 if(e.dead)return;
 let player=null;
 for(const p of s.players)if(!p.dead){player=p;break;}
 if(!player)return;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(e.stun>0){e.stun--;return;}
 e.facing=player.x<e.x?-1:1;e.vx=0;

 if(e.ai==='idle'||e.ai==='recover'){
  e.clip=e.glass?'glassidle':'idle';
  if(--e.aiTimer<=0){
   e.ai='telegraph';e.aiTimer=BOSS.telegraph;
   const attacks=BOSS.attacks[e.phase-1];
   e.action=attacks[e.sequence++%attacks.length];e.clip='telegraph';emitSound(s,'enemy-telegraph');
  }
 }else if(e.ai==='telegraph'){
  e.clip='telegraph';
  if(--e.aiTimer<=0){e.ai='attack';e.aiTimer=BOSS.active;e.hitIds.length=0;e.clip=e.action;}
 }else{
  const first=e.aiTimer===BOSS.active;
  if(e.action==='slam'&&first){
   const orb=fire(s,e,false,true);
   if(orb){orb.y=BOSS.slamY;orb.radius=BOSS.slamRadius;orb.range=BOSS.slamRange;orb.vx=e.facing*BOSS.slamSpeed;}
   emit(s,e.x,1,0xffc77c,18);
  }
  if(e.action==='barrage'&&e.aiTimer%BOSS.barrageInterval===0){
   const orb=fire(s,e,false,true);
   if(orb)orb.y=BOSS.barrageY+(e.aiTimer%BOSS.barrageLanes)*BOSS.barrageSpacing;
  }
  if(e.action==='summon'&&first){
   for(let i=0;i<BOSS.summons;i++)spawnEnemy(s,{
    kind:'skimmer',x:e.x-BOSS.summonOffset-i*BOSS.summonSpacing,y:BOSS.summonY,delay:i*BOSS.summonDelay
   });
  }
  if(e.action==='rush'||e.action==='lunge')e.vx=e.facing*BOSS.rushSpeed;
  const reach=e.action==='sweep'?H.sweepReach:e.w/2+H.bodyReach;
  if(e.action==='sweep'||e.action==='rush'||e.action==='lunge'){
   for(const target of s.players){
    if(!e.hitIds.includes(target.id)&&Math.abs(target.x-e.x)<reach&&target.y<H.maxTargetY){
     e.hitIds.push(target.id);hurt(s,target,e,DIFFICULTY[s.config.difficulty].damage,{stop:F.swordStop});
    }
   }
  }
  if(--e.aiTimer<=0){e.ai='recover';e.aiTimer=e.glass?BOSS.glassRecovery:BOSS.recovery;}
 }
 if(e.glass)for(const target of s.players){
  if(Math.abs(target.x-e.x)<e.w/2+target.w/2&&Math.abs(target.y-e.y)<e.h)hurt(s,target,e,BOSS.contactDamage);
 }
 physics(e,s.level);
}
