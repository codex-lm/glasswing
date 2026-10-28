import {F,DIFFICULTY,energyMax} from '../data/feel.js';
import {KINDS} from '../data/kinds.js';
import {MOVES} from '../data/moves.js';
import {overlap} from './physics.js';
export function emit(s,x,y,color=0xf1ece2,count=8){for(let i=0;i<count;i++){const fx=s.effects.find(v=>v.life<=0);if(!fx)break;const angle=i/count*Math.PI*2;Object.assign(fx,{x,y,vx:Math.cos(angle)*.09,vy:Math.sin(angle)*.1,life:F.effectLife,size:.12,color});}}
export function heal(e,amount){if(e.dead)return;const glass=e.glass;e.mask=Math.min(e.maxMask,e.mask+amount);e.glass=e.mask<=0;if(glass&&!e.glass)e.survived++;}
export function hurt(s,target,source,damage=1,{projectile=null,stop=F.hitStop,knock=F.knockback}={}){
 if(target.dead||target.inv>0||target.dodge>0)return 'immune';
 const front=(source.x-target.x)*target.facing>=0;
 if(target.blocking&&target.grounded&&front){
  if(target.blockAge<(target.glass?F.glassParry:F.parry)){target.energy=Math.min(energyMax(target),target.energy+2);target.dodgeCd=0;target.flash=F.parryStop;source.stun=F.stun;source.vulnerable=true;s.hitStop=F.parryStop;s.audio='parry';emit(s,target.x,target.y+1,0xffffff,14);if(projectile){projectile.vx=-projectile.vx;projectile.team=target.team;projectile.owner=target.id;projectile.color=target.eye;projectile.hitIds=[];projectile.life=F.orbLifetime;}return 'parry';}
  if(target.energy>=1){target.energy--;target.vx=-target.facing*.09;s.audio='block';return 'block';}
 }
 if(target.vulnerable){damage*=2;target.vulnerable=false;}
 target.flash=F.flash;target.vx=(target.x>=source.x?1:-1)*knock/6;s.hitStop=Math.max(s.hitStop,target.glass?F.glassStop:stop);s.shake=F.shakeFrames;emit(s,target.x,target.y+target.h*.5,source.eye||0xffffff);
 if(target.team===2){if(target.eliteHits>0)target.eliteHits--;else target.hp-=damage;
  if(target.boss){target.mask=target.hp;target.phase=target.hp>target.maxMask/2?1:target.hp>0?2:3;if(target.hp<=0&&!target.glass){target.glass=true;target.hp=1;target.inv=F.invincible;target.phase=3;s.hitStop=F.swordStop;emit(s,target.x,target.y+2,0xf1ece2,24);}else if(target.glass&&target.hp<=0)target.dead=true;}
  else if(target.hp<=0)target.dead=true;
 }else{
  if(target.glass){if(target.upgrades.includes('secondMask')&&!target.secondUsed){target.secondUsed=true;heal(target,1);}else target.dead=true;}
  else {target.mask=Math.max(0,target.mask-damage);if(target.mask<=0){target.glass=true;s.hitStop=F.swordStop;s.audio='mask-shatter';emit(s,target.x,target.y+target.h*.8,0xf1ece2,24);}}
  target.inv=F.invincible;target.move=null;
 }
 if(target.dead){target.defeatedFrame=s.frame;target.clip='beaten';target.vx=0;target.vy=0;if(source.team!==2){source.kills++;if(source.upgrades.includes('patientMask')&&source.kills%8===0)heal(source,1);}s.audio=target.team===2?'enemy-beaten':'player-hit';}
 return 'hit';
}
export function startMove(e,name){e.move=name;e.moveFrame=0;e.attackId++;e.hitIds.length=0;e.clip=name;}
export function damageFor(e,stat){const k=KINDS[e.kind];let value=k[stat];if((stat==='punch'||stat==='kick')&&e.upgrades.includes('heavyFists'))value++;return value*(e.glass?(e.upgrades.includes('glassHeart')?4:F.glassMultiplier):1);}
export function fire(s,e,charged=false,enemy=false){const k=KINDS[e.kind];const cost=k.cost+(charged?F.chargeExtra:0);if(!enemy&&!e.glass&&e.energy<cost)return false;if(!enemy&&!e.glass)e.energy-=cost;const count=e.upgrades.includes('twinOrb')?2:1;for(let i=0;i<count;i++){const p=s.projectiles.find(v=>!v.active);if(!p)break;Object.assign(p,{active:true,x:e.x+e.facing*.55,y:e.y+e.h*.55+i*.3,vx:e.facing*(enemy?F.enemyOrbSpeed:charged?F.chargedSpeed:F.orbSpeed),radius:charged?.32:F.orbRadius,damage:enemy?DIFFICULTY[s.config.difficulty].damage:damageFor(e,'blast')*(charged?F.chargeDamage:1),team:e.team,owner:e.id,life:F.orbLifetime,range:enemy?12:k.range,travel:0,pierce:k.pierce,color:e.eye,hitIds:[]});}s.audio='blast-fire';return true;}
export function attackTick(s,e,targets){if(!e.move)return;const m=MOVES[e.move];const speed=e.upgrades.includes('quickHands')?1/.85:1;const frame=Math.floor(e.moveFrame);const box=m.frames[frame];if((e.move==='blast'||e.move==='charge')&&frame>=m.startup&&!e.fired){fire(s,e,e.move==='charge');e.fired=true;}
 if(box&&m.stat!=='blast'){const reach=box.w+(m.stat==='sword'&&e.upgrades.includes('longerNeedle')?.5:0);const hit={x:e.x+e.facing*(box.x+reach/2),y:e.y+box.y,w:reach,h:box.h};if(e.move==='downsword')hit.x=e.x;
 for(const target of targets){if(target.team===e.team||e.hitIds.includes(target.id)||!overlap(hit,target))continue;e.hitIds.push(target.id);let dmg=damageFor(e,m.stat);if(target.team!==2)dmg/=3;const result=hurt(s,target,e,dmg,{stop:e.glass?F.glassStop:box.stop,knock:box.knock});if(result==='hit'){e.energy=Math.min(energyMax(e),e.energy+1);if(m.stat==='sword')e.jumps=0;if(e.move==='divekick'||e.move==='downsword'){e.vy=e.move==='downsword'?F.pogoSpeed:F.diveBounce;if(e.upgrades.includes('pogoMaster')){e.vy*=1.2;e.energy=Math.min(energyMax(e),e.energy+1);}}if(m.stat==='kick'){target.vy=.15;if(e.upgrades.includes('shockKick'))target.stun=30;}s.audio=m.stat==='sword'?'sword-hit':e.move;}}
 // Breakable walls use the exact same active-frame rectangle as enemies.
 for(let y=Math.max(0,Math.floor(hit.y));y<Math.min(s.level.grid.length,Math.ceil(hit.y+hit.h));y++)for(let x=Math.max(0,Math.floor(hit.x-hit.w/2));x<Math.min(s.level.width,Math.ceil(hit.x+hit.w/2));x++)if(s.level.grid[y][x]===4){s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
 }
 e.moveFrame+=speed;if(e.moveFrame>=m.total){e.move=null;e.fired=false;}
}
export function projectilesTick(s,entities){for(const p of s.projectiles){if(!p.active)continue;p.x+=p.vx;p.travel+=Math.abs(p.vx);if(--p.life<=0||p.travel>p.range){p.active=false;continue;}for(const target of entities){if(target.team===p.team||target.dead||p.hitIds.includes(target.id))continue;if(Math.abs(p.x-target.x)>target.w/2+p.radius||p.y+p.radius<target.y||p.y-p.radius>target.y+target.h)continue;const source=entities.find(e=>e.id===p.owner)||{x:p.x-p.vx,eye:p.color,team:p.team};const proxy={...source,x:p.x-p.vx};const damage=target.team===2?p.damage:p.team===2?p.damage:p.damage/3;const result=hurt(s,target,proxy,damage,{projectile:p});if(result==='parry'){source.stun=F.stun;source.vulnerable=true;break;}if(result!=='immune'){p.hitIds.push(target.id);if(p.pierce>0)p.pierce--;else p.active=false;break;}}}}
