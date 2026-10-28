import {entity} from '../core/entity.js';
import {BOSS} from '../data/boss.js';
import {F,DIFFICULTY} from '../data/feel.js';
import {hurt,fire,emit} from '../core/combat.js';
import {physics} from '../core/physics.js';
import {spawnEnemy} from './enemies/wild.js';
export function spawnBoss(s){const e=entity(s.nextId++,'brawler',55,1,2,s.config.difficulty);Object.assign(e,{boss:true,phase:1,hp:BOSS.hp*(s.config.mode==='coop'?F.coopHP:1),maxMask:BOSS.hp*(s.config.mode==='coop'?F.coopHP:1),mask:BOSS.hp*(s.config.mode==='coop'?F.coopHP:1),eye:'#19B8A6',w:e.w*3,h:e.h*3,ai:'idle',aiTimer:20,sequence:0});s.enemies.push(e);s.bossStarted=true;s.audio='boss-roar';return e;}
export function bossTick(s,e){if(e.dead)return;const p=s.players.find(p=>!p.dead);if(!p)return;for(const key of ['inv','flash'])if(e[key]>0)e[key]--;if(e.stun>0){e.stun--;return;}e.facing=p.x<e.x?-1:1;e.vx=0;
 if(e.ai==='idle'||e.ai==='recover'){e.clip=e.glass?'glassidle':'idle';if(--e.aiTimer<=0){e.ai='telegraph';e.aiTimer=BOSS.telegraph;e.action=BOSS.attacks[e.phase-1][e.sequence++%2];e.clip='telegraph';}}
 else if(e.ai==='telegraph'){e.clip='telegraph';if(--e.aiTimer<=0){e.ai='attack';e.aiTimer=BOSS.active;e.hitIds=[];e.clip=e.action;}}
 else{
  const first=e.aiTimer===BOSS.active;
  if(e.action==='slam'&&first){fire(s,e,false,true);const orb=s.projectiles.filter(p=>p.active).at(-1);if(orb){orb.y=1.12;orb.radius=.22;orb.range=18;orb.vx=e.facing*.12;}emit(s,e.x,1,0xffc77c,18);}
  if(e.action==='barrage'&&e.aiTimer%5===0){fire(s,e,false,true);const orb=s.projectiles.filter(p=>p.active).at(-1);if(orb)orb.y=1.4+(e.aiTimer%3)*.6;}
  if(e.action==='summon'&&first)for(let i=0;i<BOSS.summons;i++)spawnEnemy(s,{kind:'skimmer',x:e.x-3-i*2,y:3,delay:i*16});
  if(e.action==='rush'||e.action==='lunge')e.vx=e.facing*BOSS.rushSpeed;
  const reach=e.action==='sweep'?5:e.w/2+1;
  if(['sweep','rush','lunge'].includes(e.action))for(const target of s.players)if(!e.hitIds.includes(target.id)&&Math.abs(target.x-e.x)<reach&&target.y<2.3){e.hitIds.push(target.id);hurt(s,target,e,DIFFICULTY[s.config.difficulty].damage,{stop:F.swordStop});}
  if(--e.aiTimer<=0){e.ai='recover';e.aiTimer=e.glass?18:BOSS.recovery;}
 }
 if(e.glass)for(const target of s.players)if(Math.abs(target.x-e.x)<e.w/2+target.w/2&&Math.abs(target.y-e.y)<e.h)hurt(s,target,e,1);
 physics(e,s.level);
}
