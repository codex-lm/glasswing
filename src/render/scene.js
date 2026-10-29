import * as T from '../../vendor/build/three.module.js';

import {Characters} from './placeholders.js';

import {ModelBank} from './models.js';

import {FX} from './fx.js';

import {manifest} from '../ui/assets.js';

import {F} from '../data/feel.js';

export class View{

 constructor(canvas,{disabled=false}={}){this.canvas=canvas;this.available=false;this.entities=[];this.models=new Map();this.realIds=new Set();this.bank=new ModelBank();this.stats={fps:0,calls:0,triangles:0};if(disabled)return;const gl=canvas.getContext('webgl2',{antialias:true})||canvas.getContext('webgl',{antialias:true});if(!gl)return;this.renderer=new T.WebGLRenderer({canvas,context:gl,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputEncoding=T.sRGBEncoding;this.scene=new T.Scene();this.scene.background=new T.Color(0xcfe9f2);this.scene.fog=new T.Fog(0xcfe9f2,22,65);this.camera=new T.PerspectiveCamera(38,1,.1,100);this.scene.add(new T.HemisphereLight(0xe3f6ff,0x496043,.9));const key=new T.DirectionalLight(0xffedc6,.8);key.position.set(-5,12,10);this.scene.add(key);const fill=new T.DirectionalLight(0xa8ddeb,.3);fill.position.set(10,6,-5);this.scene.add(fill);this.characters=new Characters(this.scene);this.fx=new FX(this.scene);this.setGroup=new T.Group();this.scene.add(this.setGroup);this.setInstalled=null;this.forest=new T.Group();this.scene.add(this.forest);this.available=true;this.resize();window.addEventListener('resize',()=>this.resize());}

 resize(){if(!this.available)return;const w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}

 setLevel(level){if(!this.available)return;this.level=level;this.setInstalled=null;this.forest.visible=true;for(const child of [...this.setGroup.children])this.setGroup.remove(child);for(const m of this.models.values())this.scene.remove(m.group);this.models.clear();this.realIds.clear();for(const child of [...this.forest.children]){child.geometry.dispose();child.material.dispose();this.forest.remove(child);}const hollow=level.id==='hollow'||level.id==='arena-hollow',canopy=level.id==='canopy'||level.id==='arena-canopy',nest=level.id==='nest';this.scene.background.set(hollow?0x2a2f4a:nest?0xc9d9bb:canopy?0xd9edf3:0xcfe9f2);this.scene.fog.color.copy(this.scene.background);const batches=new Map();const temp=new T.Object3D();const put=(type,color,x,y,z,sx,sy,sz,rz=0)=>{const key=`${type}-${color}`;if(!batches.has(key))batches.set(key,{type,color,items:[]});batches.get(key).items.push([x,y,z,sx,sy,sz,rz]);};

 for(let y=0;y<level.grid.length;y++)for(let x=0;x<level.width;x++){const tile=level.grid[y][x];if(!tile)continue;if(tile===1){put('box',0x385c46,x+.5,y-10,0,1,22,2);put('box',0x87b968,x+.5,y+.97,0,1,.12,2.1);}if(tile===2||tile===3){put('box',0x648452,x+.5,y+.9,0,1,.2,1.2,tile===3?.6:0);}if(tile===4)put('box',0x88a27a,x+.5,y+.5,0,.98,1,1.2);if(tile===5)put('ball',0x79e0c8,x+.5,y+.3,0,.5,.3,.6);}

 // Deterministic painted layers: appearance never consumes the simulation RNG.

 for(let i=-8;i<level.width+12;i+=3){const s=Math.sin(i*7.17);put('box',hollow?0x44506a:0x86b9aa,i,5,-16,.6,12,1);put('ball',hollow?0x647d86:0xa0cba7,i,10+s*2,-16,4.5,3,2);put('box',hollow?0x37475c:0x55876e,i+1,4,-7,.45,9,1);put('ball',hollow?0x486e6c:0x70a475,i+1,8+s,-7,3,2.3,1.5);put('ball',hollow?0x6c988b:0xb6d593,i,1,-4,2,.5,1);}

 for(let i=0;i<level.width;i+=2){put('leaf',0x457953,i,1.25,.6,.6,.7,.5);if(hollow){put('ball',0x79e0c8,i+.6,1.4,-1,.32,.18,.3);put('box',0xacc6ad,i+.6,1.2,-1,.08,.3,.08);}}

 // The four areas have distinct landmarks even before delivered scenery exists.
 if(level.id==='landing'){put('ball',0x6d7760,3,1,-1.8,2,.18,1.2);for(let i=0;i<8;i++)put('ball',0xb7c79a,3+Math.cos(i)*2,1.1,-1.8+Math.sin(i),.5,.2,.35);}
 if(canopy)for(let x=3;x<level.width;x+=7){put('box',0x587f65,x,5,-4,7,.23,.6,.12);put('ball',0xb8d699,x+2,6,-6,3,.9,1);}
 if(nest)for(let x=2;x<level.width;x+=4){put('box',0x658064,x,2.8,-2,.3,5,.5,.5);put('box',0x7e9875,x+1,3,-3,.26,5,.4,-.5);put('leaf',0xf1ece2,x+.5,2.2,-1.6,.2,.45,.15);}
 for(const p of level.pieces||[]){const z=p.z??-1;if(p.piece.startsWith('tree')){put('box',0x55876e,p.x,p.y+3,z,.5,6,.5);put('ball',0x70a475,p.x,p.y+6,z,2.5,2,1.5);}else if(p.piece==='fern')put('leaf',0x457953,p.x,p.y+.35,z,.7,.8,.5);else if(p.piece==='mushroom'){put('box',0xacc6ad,p.x,p.y+.2,z,.1,.4,.1);put('ball',0x79e0c8,p.x,p.y+.5,z,.4,.2,.4);}else{put('box',0xb1ba92,p.x,p.y+.35,z,.8,.7,.8);put('ball',0xf1ece2,p.x,p.y+.9,z,.45,.2,.4);}}

 for(const b of batches.values()){const geo=b.type==='box'?new T.BoxGeometry(1,1,1):b.type==='leaf'?new T.ConeGeometry(.5,1,4):new T.IcosahedronGeometry(1,1);const mesh=new T.InstancedMesh(geo,new T.MeshLambertMaterial({color:b.color}),b.items.length);for(let i=0;i<b.items.length;i++){const [x,y,z,sx,sy,sz,rz]=b.items[i];temp.position.set(x,y,z);temp.scale.set(sx,sy,sz);temp.rotation.set(0,0,rz);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);}this.forest.add(mesh);}

 }

 installSet(key){const source=this.bank.cache.get(key)?.scene;if(!source)return;source.updateMatrixWorld(true);const level=this.level;const placements=[];for(let y=0;y<level.grid.length;y++)for(let x=0;x<level.width;x++){const type=level.grid[y][x],piece={1:'ground-1',2:'platform',3:'slope',4:'breakable-wall',5:'mushroom'}[type];if(piece)placements.push({piece,x:x+.5,y:type===2?y+.8:y,z:0,scale:1});}placements.push(...level.pieces||[]);for(let x=0;x<level.width;x+=4){placements.push({piece:'tree-1',x,y:1,z:-7,scale:1},{piece:'fern',x:x+1,y:1,z:-1,scale:1});}for(let i=0;i<3;i++)placements.push({piece:'background-'+(i+1),x:level.width/2,y:0,z:-25+i*5,scale:1});
  const batches=new Map(),transform=new T.Object3D(),matrix=new T.Matrix4();for(const p of placements){const piece=source.getObjectByName(p.piece);if(!piece)continue;transform.position.set(p.x,p.y,p.z||0);transform.scale.setScalar(p.scale||1);transform.rotation.y=p.flip?Math.PI:0;transform.updateMatrix();piece.traverse(mesh=>{if(!mesh.isMesh)return;const id=mesh.geometry.uuid+':'+(Array.isArray(mesh.material)?mesh.material.map(m=>m.uuid).join(','):mesh.material.uuid);if(!batches.has(id))batches.set(id,{geometry:mesh.geometry,material:mesh.material,matrices:[]});matrix.multiplyMatrices(transform.matrix,mesh.matrixWorld);batches.get(id).matrices.push(matrix.clone());});}
  if(!source.getObjectByName('ground-1')){this.setInstalled=key;return;}for(const b of batches.values()){const mesh=new T.InstancedMesh(b.geometry,b.material,b.matrices.length);for(let i=0;i<b.matrices.length;i++)mesh.setMatrixAt(i,b.matrices[i]);this.setGroup.add(mesh);}this.forest.visible=false;this.setInstalled=key;
 }
 render(state,alpha=1,delta=1/60,loadModels=true){if(!this.available)return;if(loadModels&&manifest.sets?.[this.level.id]){const key='set:'+this.level.id;this.bank.load(key,manifest.sets[this.level.id]);if(this.bank.cache.has(key)&&this.setInstalled!==key)this.installSet(key);}const entities=state.players.concat(state.enemies||[]);for(const e of entities){const key=e.boss?'old-glasswing':e.team===2?`wild-${e.kind}`:e.kind;if(loadModels&&manifest.models?.[key]){this.bank.load(key,manifest.models[key]);if(!this.models.has(e.id)){const model=this.bank.instantiate(key,e.eye);if(model){this.models.set(e.id,model);this.realIds.add(e.id);this.scene.add(model.group);}}const model=this.models.get(e.id);if(model){this.bank.pose(model,e,delta,alpha);model.group.visible=!(e.dead&&state.frame-e.defeatedFrame>50);}}}

 this.characters.draw(entities,alpha,state.frame,this.realIds);this.fx.draw(state);const x=state.camera?.x||9;const targetY=this.canvas.clientHeight<500?2:3.4;const distance=F.cameraWidth/(2*Math.tan(19*Math.PI/180)*this.camera.aspect);this.scene.fog.near=distance+6;this.scene.fog.far=distance+40;this.camera.position.set(x,targetY+distance*.1,distance);this.camera.lookAt(x,targetY,0);if(state.shake>0){this.camera.position.x+=Math.sin(state.frame*13)*.035;}this.renderer.render(this.scene,this.camera);this.stats.calls=this.renderer.info.render.calls;this.stats.triangles=this.renderer.info.render.triangles;if(delta>0)this.stats.fps=this.stats.fps*.95+Math.min(120,1/delta)*.05;

 }

}

