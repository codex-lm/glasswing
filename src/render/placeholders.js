import * as T from '../../vendor/build/three.module.js';
import {KINDS} from '../data/kinds.js';
import {PALETTE} from '../data/feel.js';

// Instanced parts share draw calls. Poses never alter collision bodies.
export class Characters {
 constructor(scene) {
  this.temp=new T.Object3D();this.color=new T.Color();this.parts={};
  const sphere=new T.SphereGeometry(1,12,8),box=new T.BoxGeometry(1,1,1);
  const wing=new T.Shape();wing.moveTo(0,0);wing.quadraticCurveTo(-.4,.4,-.18,1);wing.quadraticCurveTo(.3,.7,0,0);
  for(const [name,geo,color] of [['body',sphere,PALETTE.body],['mask',sphere,PALETTE.mask],['eyes',sphere,0xffffff],['wings',new T.ShapeGeometry(wing,6),PALETTE.body],['sword',box,PALETTE.body],['cracks',box,PALETTE.crack],['glow',sphere,0xffffff]]) {
   const mesh=new T.InstancedMesh(geo,new T.MeshBasicMaterial({color,side:T.DoubleSide,fog:false}),1200);
   mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;this.parts[name]={mesh,n:0};scene.add(mesh);
  }
  // Radial halos preserve the black body; these are not post-process bloom.
  const haloMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
   vertexShader:'varying vec2 vUv; varying vec3 vColor; void main(){vUv=uv;vColor=instanceColor;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}',
   fragmentShader:'varying vec2 vUv; varying vec3 vColor; void main(){float a=pow(max(0.0,1.0-length(vUv-.5)*2.0),2.0);gl_FragColor=vec4(vColor,a*.65);}'
  });
  const halo=new T.InstancedMesh(new T.PlaneGeometry(1,1),haloMaterial,200);halo.frustumCulled=false;this.parts.halo={mesh:halo,n:0};scene.add(halo);
  const shadows=new T.InstancedMesh(new T.CircleGeometry(1,16),new T.MeshBasicMaterial({color:0x15281f,transparent:true,opacity:.18,depthWrite:false}),60);
  shadows.frustumCulled=false;scene.add(shadows);this.parts.shadow={mesh:shadows,n:0};
 }
 add(name,x,y,z,sx,sy,sz,rz=0,color=null,rx=0) {
  const part=this.parts[name];if(part.n>=part.mesh.instanceMatrix.count)return;
  const o=this.temp;o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,0,rz);o.updateMatrix();part.mesh.setMatrixAt(part.n,o.matrix);
  if(color!==null){this.color.set(color);part.mesh.setColorAt(part.n,this.color);}part.n++;
 }
 draw(entities,alpha,frame,realModels) {
  for(const part of Object.values(this.parts))part.n=0;
  for(const e of entities) {
   if(realModels?.has(e.id)||e.dead&&e.team===2&&frame-e.defeatedFrame>50)continue;
   const k=KINDS[e.kind],size=e.boss?3:e.showcase?2.2:1,x=e.px+(e.x-e.px)*alpha;
   let y=e.py+(e.y-e.py)*alpha;
   const h=k.height*size,w=k.bodyWidth*size,f=e.facing,walk=e.clip==='run'||e.clip==='move',phase=frame*.2;
   const winding=e.ai==='telegraph',guard=e.blocking,curl=e.dead,crouch=curl?.38:winding?.16:e.kind==='brawler'?.04:0;
   const bob=walk?Math.abs(Math.sin(phase))*.035:Math.sin(frame*.035)*.015;
   if(e.dead&&e.team===2)y+=(frame-e.defeatedFrame)*.025;
   if(e.inv&&Math.floor(frame/4)%2)continue;
   const body=e.flash>0?0xffffff:PALETTE.body,eye=winding&&Math.floor(frame/3)%2?0xffffff:e.eye;
   const lean=e.clip==='dodge'?.35*f:winding?-.18*f:e.move?.14*f:0,headX=x+f*w*.16+lean,headY=y+h*(.82-crouch)+bob;
   this.add('body',x,y+h*(.5-crouch*.65)+bob,0,w*.55,h*.3,w*.35,curl?1.3:lean,body);
   this.add('body',headX,headY,0,w*.53,h*.25,w*.4,curl?.5*f:0,body);
   const hasMask=!e.glass&&(e.team!==2||e.boss||e.eliteHits>0);
   if(hasMask)this.add('mask',headX,headY+h*.02,.22*size,w*.48,h*.22,.13*size,0,e.parryFlash?0xffffff:PALETTE.mask);
   for(let side=-1;side<=1;side+=2) {
    const legSwing=curl?side*1.15:walk?Math.sin(phase+side)*.35:0;
    this.add('body',x+side*w*.27,y+h*(curl?.3:.16),0,w*.18,h*.19,w*.2,legSwing,body);
    const attacking=(e.move&&e.moveFrame>=3)||e.ai==='attack';
    const armX=x+side*w*.55+(attacking&&side===f?f*.38*size:0)+(guard?f*.22*size:winding?-f*.15*size:0);
    const armY=y+h*(guard?.64:winding?.53:curl?.35:.47),angle=curl?side*1.2:guard?-f*.85:winding?-f*.65:attacking?f*1.1:side*.15;
    this.add('body',armX,armY,.08,w*.22,h*.26,w*.22,angle,body);
    const eyeX=headX+side*w*.18,eyeY=headY+h*.07;
    this.add('eyes',eyeX,eyeY,.34*size,w*.095,h*.04,.04*size,0,eye);
    if(e.glass||winding||e.elite)this.add('halo',eyeX,eyeY,.4*size,w*.65,w*.5,1,0,eye);
    if(e.kind==='spark') {
     const px=armX+Math.sin(angle)*h*.2,py=armY-Math.cos(angle)*h*.2,r=.1*size*(e.charge?1.6:1);
     this.add('glow',px,py,.18*size,r,r,r,0,eye);this.add('halo',px,py,.35*size,r*6,r*6,1,0,eye);
    }
   }
   for(let i=0;i<4;i++) {
    const side=i<2?-1:1,upper=i%2===0,spread=e.clip==='glide'?1.25:winding?.9:curl?.25:.6,flap=Math.sin(frame*(e.grounded?.12:.4)+i*.8)*.15;
    this.add('wings',x+side*w*.48,y+h*((upper?.78:.54)-crouch),-.16*size,k.wing*size,k.wing*size,.8,side*(spread+(upper?.1:1.15)+flap),body);
   }
   const swordOut=e.move==='sword'||e.move==='downsword'||e.action==='sweep'&&e.ai==='attack';
   this.add('sword',x+(swordOut?f*.9*size:f*w*.62),y+(e.move==='downsword'?.15:h*.4),.13,swordOut?1.5*size:.07*size,swordOut?.045*size:.85*size,.05,swordOut?0:-f*.25,body);
   // Each lost mask point adds a crack branch, including early damage.
   const cracks=Math.min(8,Math.max(0,Math.ceil(e.maxMask-e.mask)));
   if(hasMask)for(let i=0;i<cracks;i++) {
    const offset=(i%4-1.5)*w*.15,cy=headY+h*(i<4?-.06:.035);
    this.add('cracks',headX+offset,cy,.355*size,.025*size,h*.14,.02,i%2?-.4:.35,PALETTE.crack);
    this.add('cracks',headX+offset+.035*size,cy+h*.045,.36*size,.02*size,h*.07,.02,1,PALETTE.crack);
   }
   if(e.parryFlash)this.add('halo',headX,headY,.4*size,w*2,h*.8,1,0,0xffffff);
   this.add('shadow',x,1.015,-.05,w*.8,w*.4,1,0,null,-Math.PI/2);
  }
  for(const p of Object.values(this.parts)){p.mesh.count=p.n;p.mesh.instanceMatrix.needsUpdate=true;if(p.mesh.instanceColor)p.mesh.instanceColor.needsUpdate=true;}
 }
}
