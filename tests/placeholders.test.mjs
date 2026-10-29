import assert from 'node:assert/strict';
import * as T from '../vendor/build/three.module.js';
import {Characters} from '../src/render/placeholders.js';
import {entity} from '../src/core/entity.js';

const characters=new Characters(new T.Scene()),color=new T.Color();
assert(characters.parts.halo.mesh.instanceColor,'zero-halo title still compiles an instancing-colour shader');
for(const kind of ['brawler','skimmer','spark']) {
 const p=entity(1,kind);characters.draw([p],1,0);
 assert.equal(characters.parts.wings.mesh.count,4);
 characters.parts.body.mesh.getColorAt(0,color);
 assert.equal(color.convertLinearToSRGB().getHex(),0x0b0b0d,'body palette is preserved through sRGB output');
 const left=new T.Matrix4(),right=new T.Matrix4(),tip=new T.Vector3(0,1,0);
 characters.parts.wings.mesh.getMatrixAt(0,left);characters.parts.wings.mesh.getMatrixAt(2,right);
 assert(tip.clone().applyMatrix4(left).x<p.x,'left wing spreads away from the body');
 assert(tip.clone().applyMatrix4(right).x>p.x,'right wing spreads away from the body');
 p.flash=4;characters.draw([p],1,0);characters.parts.body.mesh.getColorAt(0,color);
 assert.equal(color.getHex(),0xffffff);assert.equal(characters.parts.body.mesh.material.color.getHex(),0xffffff,'hit flash is not multiplied by a black material');
}
const imported=entity(1);
characters.draw([imported],1,0,new Set([1]));
assert.equal(characters.parts.body.mesh.count,0);
assert.equal(characters.parts.shadow.mesh.count,1,'imported models retain the shared soft shadow');
imported.inv=48;imported.dead=true;
characters.draw([imported],1,4);
assert(characters.parts.body.mesh.count>0,'downed placeholders do not blink out');
console.log('PASS placeholders: four outward wings, visible hit flash, imported shadows, downed visibility and initialized empty halo attributes');
