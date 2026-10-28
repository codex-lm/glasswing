import * as T from '../../vendor/build/three.module.js';

import {KINDS} from '../data/kinds.js';

import {PALETTE} from '../data/feel.js';

// One instanced draw per material/geometry across all characters, including their four wings.

export class Characters{

 constructor(scene){this.scene=scene;this.temp=new T.Object3D();this.color=new T.Color();this.parts={};const sphere=new T.SphereGeometry(1,12,8),box=new T.BoxGeometry(1,1,1);const wing=new T.Shape();wing.moveTo(0,0);wing.quadraticCurveTo(-.4,.4,-.18,1);wing.quadraticCurveTo(.3,.7,0,0);const wingGeo=new T.ShapeGeometry(wing,6);for(const [name,geo,color] of [['body',sphere,PALETTE.body],['mask',sphere,PALETTE.mask],['eyes',sphere,0xffffff],['wings',wingGeo,PALETTE.body],['sword',box,PALETTE.body],['cracks',box,PALETTE.crack],['glow',sphere,0xffffff]]){const mesh=new T.InstancedMesh(geo,new T.MeshBasicMaterial({color,side:T.DoubleSide}),1200);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;this.parts[name]={mesh,n:0};scene.add(mesh);}const shadows=new T.InstancedMesh(new T.CircleGeometry(1,16),new T.MeshBasicMaterial({color:0x15281f,transparent:true,opacity:.18,depthWrite:false}),60);shadows.frustumCulled=false;scene.add(shadows);this.parts.shadow={mesh:shadows,n:0};}

 add(name,x,y,z,sx,sy,sz,rz=0,color=null,rx=0){const part=this.parts[name];if(part.n>=part.mesh.instanceMatrix.count)return;const o=this.temp;o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,0,rz);o.updateMatrix();part.mesh.setMatrixAt(part.n,o.matrix);if(color!==null){this.color.set(color);part.mesh.setColorAt(part.n,this.color);}part.n++;}

 draw(entities,alpha,frame,realModels=new Set()){

 for(const part of Object.values(this.parts))part.n=0;

 for(const e of entities){if(realModels.has(e.id)||e.dead&&e.team===2&&frame-e.defeatedFrame>50)continue;const k=KINDS[e.kind];const size=e.boss?3:1;let x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha;const h=k.height*size,w=k.bodyWidth*size;const f=e.facing;const walk=e.clip==='run'||e.clip==='move';const phase=frame*.2;const bob=walk?Math.abs(Math.sin(phase))*.035:Math.sin(frame*.035)*.015;

 if(e.dead&&e.team===2){y+=(frame-e.defeatedFrame)*.035;}

 if(e.inv&&Math.floor(frame/4)%2)continue;

 const hit=e.flash>0;const body=hit?0xffffff:PALETTE.body;const eye=e.ai==='telegraph'&&Math.floor(frame/3)%2?0xffffff:e.eye;

 const lean=e.clip==='dodge'?.35*f:e.move?.14*f:0;const headX=x+f*w*.16+lean;

 this.add('body',x,y+h*.5+bob,0,w*.55,h*.3,w*.35,e.dead?1.3:lean,body);

 this.add('body',headX,y+h*.82+bob,0,w*.53,h*.25,w*.4,0,body);

 this.add('mask',headX,y+h*.84+bob,.22*size,w*.48,h*.22,.13*size,0,PALETTE.mask);

 // The absent mask exposes only glowing eyes; no coloured body replaces it.

 if(e.glass||e.team===2&&!e.boss&&!e.eliteHits)this.parts.mask.n--;

 for(let side=-1;side<=1;side+=2){const legSwing=walk?Math.sin(phase+side)*.35:0;this.add('body',x+side*w*.27,y+h*.16,0,w*.18,h*.19,w*.2,legSwing,body);const attacking=e.move&&e.moveFrame>=3;this.add('body',x+side*w*.55+(attacking&&side===f?f*.38:0),y+h*.47,.08,w*.22,h*.26,w*.22,attacking?f*1.1:side*.15,body);this.add('eyes',headX+side*w*.18,y+h*.89+bob,.34*size,w*.095,h*.04,.04*size,0,eye);if(e.kind==='spark')this.add('glow',x+side*w*.65,y+h*.29,.17,.11*size*(e.charge?1.6:1),.11*size,.1*size,0,eye);}

 for(let i=0;i<4;i++){const side=i<2?-1:1,upper=i%2===0;const spread=e.clip==='glide'?1.25:.6;const flap=Math.sin(frame*(e.grounded?.12:.4)+i*.8)*.15;this.add('wings',x+side*w*.48,y+h*(upper?.78:.54),-.16*size,k.wing*size,k.wing*size,.8,side*(spread+(upper?.1:1.15)+flap),body);}

 const swordOut=e.move==='sword'||e.move==='downsword';this.add('sword',x+(swordOut?f*.9:f*w*.62),y+(e.move==='downsword'?.15:h*.4),.13,swordOut?1.5:.07,swordOut?.045:.85,.05,swordOut?0:-f*.25,body);

 const cracks=Math.max(0,Math.ceil((1-e.mask/e.maxMask)*3));if(!e.glass&&(e.team!==2||e.boss||e.eliteHits))for(let i=0;i<cracks;i++){this.add('cracks',headX+(i-1)*w*.17,y+h*(.78+i*.045),.355*size,.025*size,h*.2,.02,(i%2?-.4:.35),PALETTE.crack);this.add('cracks',headX+(i-1)*w*.17+.04*size,y+h*(.84+i*.04),.36*size,.025*size,h*.08,.02,1,PALETTE.crack);}

 this.add('shadow',x,1.015,-.05,w*.8,w*.4,1,0,null,-Math.PI/2);

 }

 for(const p of Object.values(this.parts)){p.mesh.count=p.n;p.mesh.instanceMatrix.needsUpdate=true;if(p.mesh.instanceColor)p.mesh.instanceColor.needsUpdate=true;}

 }

}

