import {F} from '../data/feel.js';
export function overlap(a,b){return a.x-a.w/2<b.x+b.w/2&&a.x+a.w/2>b.x-b.w/2&&a.y<b.y+b.h&&a.y+a.h>b.y;}
export function tile(level,x,y){return level.grid?.[y]?.[x]||0;}
export function solid(t){return t===1||t===4;}
export function physics(e,level,{gravity=true,drop=false}={}){
 if(gravity)e.vy=Math.max(-F.terminal,e.vy-F.gravity);
 let motionX=e.vx;if(e.knockFrames>0){const push=e.knockback/e.knockFrames;motionX+=push;e.knockback-=push;e.knockFrames--;}
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(motionX),Math.abs(e.vy))/F.physicsStep));
 e.grounded=false;
 for(let s=0;s<steps;s++){
  e.x+=motionX/steps;
  for(let y=Math.floor(e.y+F.collisionSkin);y<=Math.floor(e.y+e.h-F.collisionSkin);y++)for(let x=Math.floor(e.x-e.w/2);x<=Math.floor(e.x+e.w/2);x++)if(solid(tile(level,x,y))){if(motionX>0)e.x=x-e.w/2-F.collisionSkin;else if(motionX<0)e.x=x+1+e.w/2+F.collisionSkin;e.vx=0;motionX=0;}
  const before=e.y;e.y+=e.vy/steps;
  for(let y=Math.floor(Math.min(before,e.y));y<=Math.floor(e.y+e.h);y++)for(let x=Math.floor(e.x-e.w/2+F.collisionSkin);x<=Math.floor(e.x+e.w/2-F.collisionSkin);x++){
   const t=tile(level,x,y);const top=t===3?y+Math.max(0,Math.min(1,e.x-x)):y+1;
   if(t===3&&e.vy<=0&&Math.abs(before-top)<=F.slopeStep){e.y=top;e.vy=0;e.grounded=true;}
   else if((solid(t)||t===2&&!drop||t===3)&&e.vy<=0&&before>=top-F.landTolerance&&e.y<top){e.y=top;e.vy=0;e.grounded=true;}
   else if(solid(t)&&e.vy>0&&before+e.h<=y+F.ceilingTolerance&&e.y+e.h>y){e.y=y-e.h-F.collisionSkin;e.vy=0;}
  }
 }
 e.x=Math.max(e.w/2,Math.min((level.width||F.defaultLevelWidth)-e.w/2,e.x));
 if(e.grounded)e.coyote=F.coyote;else e.coyote=Math.max(0,e.coyote-1);
}
