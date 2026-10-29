import {F} from '../data/feel.js';
import {CAMERA} from '../data/camera.js';

// Reused state; fitting the camera allocates no temporary vectors or player arrays.
export class Framing {
 constructor(){this.x=9;this.y=5;this.distance=0;}
 update(players,camera,levelWidth,aspect,alpha=1) {
  const half=CAMERA.fov*Math.PI/360,tilt=Math.atan(CAMERA.tilt);
  const above=CAMERA.tilt+Math.tan(half-tilt);
  const below=Math.tan(half+tilt)-CAMERA.tilt;
  let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity;
  for(const p of players) {
   const size=p.showcase?2.2:1;
   const x=p.px+(p.x-p.px)*alpha;
   // A fall cannot drag the camera below the ground row.
   const y=Math.max(1,p.py+(p.y-p.py)*alpha);
   left=Math.min(left,x-p.w*size/2);right=Math.max(right,x+p.w*size/2);
   bottom=Math.min(bottom,y);top=Math.max(top,y+p.h*size);
  }
  if(!players.length){left=right=camera.x;bottom=1;top=3;}
  const baseWidth=Math.max(CAMERA.minWidth,F.cameraWidth*Math.min(1,aspect/CAMERA.portraitAspect));
  const wantedWidth=Math.max(baseWidth,right-left+CAMERA.padX*2);
  const wantedHeight=top-bottom+CAMERA.padY*2;
  const required=Math.max(wantedWidth*Math.cos(tilt)/(2*Math.tan(half)*aspect),wantedHeight/(above+below));
  // Expand immediately to keep an aerial partner visible; shrink gently on landing.
  this.distance=this.distance<required?required:this.distance+(required-this.distance)*CAMERA.ease;
  const halfWidth=this.distance*Math.tan(half)*aspect/Math.cos(tilt);
  const floor=this.distance*below;
  const minY=top+CAMERA.padY-this.distance*above;
  const maxY=bottom-CAMERA.padY+this.distance*below;
  const wantedY=Math.max(floor,(top+bottom)/2);
  this.y+= (wantedY-this.y)*CAMERA.ease;
  this.y=Math.max(floor,Math.min(maxY,Math.max(minY,this.y)));
  const minX=right+CAMERA.padX-halfWidth,maxX=left-CAMERA.padX+halfWidth;
  this.x=Math.min(maxX,Math.max(minX,camera.x));
  this.x=levelWidth>=halfWidth*2?Math.max(halfWidth,Math.min(levelWidth-halfWidth,this.x)):levelWidth/2;
  return this;
 }
}
