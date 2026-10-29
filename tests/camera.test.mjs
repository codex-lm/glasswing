import assert from 'node:assert/strict';
import * as T from '../vendor/build/three.module.js';
import {entity} from '../src/core/entity.js';
import {Framing} from '../src/render/framing.js';
import {CAMERA} from '../src/data/camera.js';

for(const aspect of [16/9,390/674,844/220,1])for(const heights of [[1],[12],[1,12],[1,25]]) {
 const players=heights.map((y,i)=>entity(i,'skimmer',20+i*12,y));
 const framing=new Framing(),camera=new T.PerspectiveCamera(CAMERA.fov,aspect,.1,200);
 for(let frame=0;frame<120;frame++) {
  const view=framing.update(players,{x:26},60,aspect);
  camera.position.set(view.x,view.y+view.distance*CAMERA.tilt,view.distance);
  camera.lookAt(view.x,view.y,0);camera.updateMatrixWorld(true);
  for(const p of players)for(const dx of [-p.w/2,p.w/2])for(const dy of [0,p.h]) {
   const point=new T.Vector3(p.x+dx,p.y+dy,0).project(camera);
   assert(Math.abs(point.x)<1&&Math.abs(point.y)<1,JSON.stringify({aspect,heights,point}));
  }
  const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(0,-1),camera);
  const ground=ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,0,1),0),new T.Vector3());
  assert(ground.y>=-1e-6,'camera never looks below the ground row');
 }
}
console.log('PASS camera projection: portrait, landscape, high jumps, vertical co-op separation and ground bound');
