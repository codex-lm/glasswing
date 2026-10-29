import {B,edge} from '../core/input.js';
import {F} from '../data/feel.js';
import {KINDS} from '../data/kinds.js';
import {physics} from '../core/physics.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';
import {MOVES} from '../data/moves.js';
import {startMove,attackTick,emit} from '../core/combat.js';

const timers=['inv','stun','flash','parryFlash','dodgeCd','comboTimer'];
const dodgeMotion={gravity:false};
// Physics reads options synchronously and never retains this scratch object.
const motion={gravity:true,drop:false};

export function movement(e,input,level){
 const k=KINDS[e.kind],maxJumps=k.jumps+(e.upgrades.includes('thirdFlap')?U.thirdFlap:0);
 const speed=k.speed/F.hz*(e.glass?F.glassSpeed:1)*(e.upgrades.includes('windRunner')?U.windRunner:1);
 const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
 if(axis)e.facing=axis;
 e.vx=axis?Math.max(-speed,Math.min(speed,e.vx+axis*F.acceleration)):e.vx*F.friction;
 if(edge(input,e.prev,B.jump))e.jumpBuffer=F.jumpBuffer;
 else if(e.jumpBuffer)e.jumpBuffer--;
 if(e.grounded){e.jumps=0;e.glide=k.glide+(e.upgrades.includes('longGlide')?U.longGlide:0);}
 if(e.jumpBuffer&&(e.grounded||e.coyote||e.jumps<maxJumps)){
  e.vy=Math.sqrt(2*F.gravity*k.jump)+F.gravity/2;
  e.jumps=e.grounded||e.coyote?1:e.jumps+1;
  e.coyote=0;e.jumpBuffer=0;e.grounded=false;e.clip=e.jumps>1?'doublejump':'jump';
 }
 if(!(input&B.jump)&&(e.prev&B.jump)&&e.vy>0)e.vy*=F.jumpCut;
 const gliding=!!(input&B.jump)&&e.vy<=0&&!e.grounded&&e.glide>0;
 if(gliding){e.vy=-F.glideFall;e.glide--;e.clip='glide';}
 else if(!e.grounded)e.clip='jump';
 else e.clip=axis?'run':e.glass?'glassidle':'idle';
 motion.gravity=!gliding;motion.drop=!!(input&B.down);
 physics(e,level,motion);
}

export function playerTick(s,e,input,targets,resolveAttacks=true){
 if(e.dead)return;
 for(const key of timers)if(e[key]>0)e[key]--;
 if(e.stun){physics(e,s.level);e.prev=input;return;}

 const block=!!(input&B.block)&&e.grounded;
 if(block){
  if(!(e.prev&B.block))e.blockAge=0;else e.blockAge++;
  e.blocking=true;e.move=null;e.charge=0;e.vx*=F.friction;e.clip='block';
  physics(e,s.level);e.prev=input;return;
 }
 e.blocking=false;e.blockAge=F.blockInactiveAge;
 if(edge(input,e.prev,B.dodge)&&e.dodgeCd===0){
  e.dodge=F.dodgeFrames;e.dodgeCd=e.upgrades.includes('dashCooldown')?F.dodgeFast:F.dodgeCooldown;
  e.move=null;e.charge=0;s.audio='dodge';emit(s,e.x,e.y+.2,0xcfe9f2,5);
 }
 if(e.dodge){
  e.dodge--;e.vx=e.facing*F.dodgeDistance/F.dodgeFrames;e.vy=0;e.clip='dodge';
  physics(e,s.level,dodgeMotion);e.prev=input;return;
 }

 const wasGrounded=e.grounded,oldJumps=e.jumps;
 movement(e,input,s.level);
 if(e.jumps>oldJumps){s.audio=e.jumps>1?'doublejump':'jump';emit(s,e.x,e.y,0xcfe9f2,4);}
 else if(!wasGrounded&&e.grounded){s.audio='land';emit(s,e.x,e.y,0xa9d68a,4);}

 if(e.move?.startsWith('punch')&&edge(input,e.prev,B.sword)&&
    e.moveFrame>=MOVES[e.move].startup+MOVES[e.move].active)e.move=null;
 if(!e.move){
  if(edge(input,e.prev,B.sword))startMove(e,input&B.down&&!e.grounded?'downsword':'sword');
  else if(edge(input,e.prev,B.attack)){
   if(input&B.down||input&(B.left|B.right))startMove(e,e.grounded?'kick':'divekick');
   else{
    e.combo=e.comboTimer?(e.combo+1)%F.punchCombo:0;e.comboTimer=F.comboWindow;
    startMove(e,'punch'+(e.combo+1));
   }
  }else if(input&B.blast){e.charge++;e.clip='charge';}
  else if(e.charge){
   startMove(e,e.charge>=F.charge?'charge':'blast');e.charge=0;e.fired=false;
  }
 }
 if(e.move){e.clip=e.move;if(resolveAttacks)attackTick(s,e,targets);}
 e.prev=input;
}
