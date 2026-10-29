import {F} from '../data/feel.js';
export function updateCamera(camera,players,width){
 let sum=0,count=0,facing=players[0].facing;
 for(const p of players)if(!p.dead){
  if(count===0)facing=p.facing;
  sum+=p.x;count++;
 }
 if(count===0){for(const p of players)sum+=p.x;count=players.length;}
 const x=sum/count;
 const target=Math.max(F.cameraWidth/2,Math.min(width-F.cameraWidth/2,x+facing*F.cameraAhead));
 if(Math.abs(target-camera.x)>F.cameraDead)camera.x+=(target-camera.x)*F.cameraEase;
 camera.y=F.cameraHeight/2;
 return camera;
}
