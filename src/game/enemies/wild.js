import {entity} from '../../core/entity.js';
import {physics,overlap} from '../../core/physics.js';
import {hurt,fire,heal,emit} from '../../core/combat.js';
import {random} from '../../core/rng.js';
import {ENEMIES} from '../../data/enemies.js';
import {F,DIFFICULTY} from '../../data/feel.js';
export function spawnEnemy(s,spawn){const e=entity(s.nextId++,spawn.kind,spawn.x,spawn.y||1,2,s.config.difficulty);const d=ENEMIES[e.kind];e.hp=d.hp*(s.config.mode==='coop'?F.coopHP:1);e.eye='#8C8C94';e.eliteHits=spawn.elite?F.eliteHits:0;e.elite=!!spawn.elite;e.aiTimer=spawn.delay||0;e.wave=spawn.wave;e.homeY=e.y;e.dropped=false;s.enemies.push(e);return e;}
export function enemyTick(s,e){if(e.boss)return;if(e.dead){if(!e.dropped){e.dropped=true;const type=random(s)<1/F.shardOdds?'shard':'energy';s.drops.push({active:true,type,x:e.x,y:Math.max(1.3,e.y+.3),life:F.dropLife});}return;}
 const players=s.players.filter(p=>!p.dead);if(!players.length)return;const target=players.reduce((a,b)=>Math.abs(a.x-e.x)<Math.abs(b.x-e.x)?a:b);if(Math.abs(e.x-s.camera.x)>F.activation)return;
 for(const key of ['inv','flash'])if(e[key]>0)e[key]--;if(e.stun>0){e.stun--;e.vx*=.8;e.clip='hit';physics(e,s.level,{gravity:e.kind!=='skimmer'});return;}
 const d=ENEMIES[e.kind],dx=target.x-e.x,dist=Math.abs(dx);if(e.ai==='idle'){
  e.facing=dx<0?-1:1;e.clip='move';e.vx=e.kind==='spark'?(dist<4?-e.facing*d.speed:dist>6?e.facing*d.speed:0):e.facing*d.speed;
  if(e.kind==='skimmer'){e.y+=(target.y+1.3+Math.sin((s.frame+e.id*17)*.035)*.6-e.y)*.03;e.vy=0;}
  if(e.aiTimer>0)e.aiTimer--;else if(dist<d.reach){e.ai='telegraph';e.charging=e.kind==='brawler'&&random(s)<.25;e.aiTimer=e.charging?d.chargeTelegraph:d.telegraph;e.vx=0;e.aimX=target.x;e.aimY=target.y+.5;s.audio='enemy-telegraph';}
 }else if(e.ai==='telegraph'){
  e.clip='telegraph';e.vx=0;
  if(--e.aiTimer<=0){e.ai='attack';e.aiTimer=d.active;e.hitIds=[];if(e.kind==='spark')fire(s,e,false,true);}
 }else if(e.ai==='attack'){
  e.clip='attack';e.vx=e.facing*(e.charging?d.chargeSpeed:d.speed);if(e.kind==='skimmer'){e.vx=Math.sign(e.aimX-e.x)*d.chargeSpeed;e.vy=Math.max(-.12,Math.min(.12,(e.aimY-e.y)*.1));}
  if(e.kind!=='spark')for(const p of players){const hit={x:e.x+e.facing*.45,y:e.y,w:e.w+1,h:e.h};if(!e.hitIds.includes(p.id)&&overlap(hit,p)){e.hitIds.push(p.id);hurt(s,p,e,DIFFICULTY[s.config.difficulty].damage*(e.elite?F.eliteDamage:1));}}
  if(--e.aiTimer<=0){e.ai='recover';e.aiTimer=d.recovery;}
 }else{e.clip='idle';e.vx*=.8;if(e.kind==='skimmer'){e.vy=.03;e.vx=-e.facing*d.speed;}if(--e.aiTimer<=0){e.ai='idle';e.aiTimer=0;}}
 physics(e,s.level,{gravity:e.kind!=='skimmer'});if(e.y<-4){e.dead=true;e.defeatedFrame=s.frame;}
}
export function wavesTick(s){if(s.config.mode==='versus')return;const lead=Math.max(...s.players.map(p=>p.x));for(let i=0;i<(s.level.waves||[]).length;i++){const w=s.level.waves[i];if(!s.lock&&!s.spawned.includes(i)&&lead>=w.trigger){s.spawned.push(i);for(let j=0;j<w.enemies.length;j++)spawnEnemy(s,{...w.enemies[j],delay:j*F.spawnDelay,wave:i});s.lock={wave:i,left:w.trigger-3,right:Math.min(s.level.width-1,w.trigger+9)};break;}}
 if(s.lock){if(s.enemies.some(e=>e.wave===s.lock.wave&&!e.dead)){for(const p of s.players)p.x=Math.max(s.lock.left,Math.min(s.lock.right,p.x));}else s.lock=null;}
 for(const d of s.drops){if(!d.active)continue;if(--d.life<=0){d.active=false;continue;}for(const p of s.players)if(!p.dead&&Math.abs(p.x-d.x)<F.collectRange&&Math.abs(p.y+.5-d.y)<1){if(d.type==='energy'){p.energy=Math.min(F.energy,p.energy+1);}else if(d.type==='shard')heal(p,1);else if(d.type==='mask')heal(p,p.maxMask);else if(d.type==='fragment'){s.fragments++;}d.active=false;emit(s,d.x,d.y,0xffd27c,5);s.audio='shard-pickup';break;}}
}
