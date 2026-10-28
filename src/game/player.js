import {B,edge} from '../core/input.js';
import {F} from '../data/feel.js';
import {KINDS} from '../data/kinds.js';
import {physics} from '../core/physics.js';
export function movement(e,input,level){
 const k=KINDS[e.kind];const maxJumps=k.jumps+(e.upgrades.includes('thirdFlap')?1:0);const speed=k.speed/F.hz*(e.glass?F.glassSpeed:1);
 const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
 if(axis)e.facing=axis;
 e.vx=axis?Math.max(-speed,Math.min(speed,e.vx+axis*F.acceleration)):e.vx*F.friction;
 if(edge(input,e.prev,B.jump))e.jumpBuffer=F.jumpBuffer;else if(e.jumpBuffer)e.jumpBuffer--;
 if(e.grounded){e.jumps=0;e.glide=k.glide+(e.upgrades.includes('longGlide')?60:0);}
 if(e.jumpBuffer&&(e.grounded||e.coyote||e.jumps<maxJumps)){e.vy=Math.sqrt(2*F.gravity*k.jump)+F.gravity/2;e.jumps=e.grounded||e.coyote?1:e.jumps+1;e.coyote=0;e.jumpBuffer=0;e.grounded=false;e.clip=e.jumps>1?'doublejump':'jump';}
 if(!(input&B.jump)&&(e.prev&B.jump)&&e.vy>0)e.vy*=F.jumpCut;
 const gliding=!!(input&B.jump)&&e.vy<=0&&!e.grounded&&e.glide>0;
 if(gliding){e.vy=-F.glideFall;e.glide--;e.clip='glide';}
 else if(!e.grounded)e.clip='jump';else e.clip=axis?'run':e.glass?'glassidle':'idle';
 physics(e,level,{gravity:!gliding,drop:!!(input&B.down)});
}
