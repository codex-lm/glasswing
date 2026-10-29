import assert from 'node:assert/strict';
import {View,graphicsContext} from '../src/render/scene.js';

const calls=[],context={};
assert.equal(graphicsContext({getContext(name){calls.push(name);return name==='webgl'?context:null;}}),context);
assert.deepEqual(calls,['webgl2','webgl']);
assert.equal(graphicsContext({getContext(name){if(name==='webgl2')throw new Error('unavailable');return context;}}),context);
assert.equal(graphicsContext({getContext:()=>null}),null);
const denied=new View({getContext(){throw new Error('Graphics context denied');}});
assert.equal(denied.available,false,'refused graphics must leave the title usable');
assert.doesNotThrow(()=>denied.setLevel({}));
assert.doesNotThrow(()=>denied.render({}));
let requested=false;
new View({getContext(){requested=true;}},{disabled:true});
assert.equal(requested,false,'explicit fallback never requests a graphics context');

const sizes=[],view={available:true,canvas:{clientWidth:0,clientHeight:0},
 renderer:{setSize:(...values)=>sizes.push(values)},camera:{updateProjectionMatrix(){}}};
View.prototype.resize.call(view);
assert.equal(view.camera.aspect,1);assert.deepEqual(sizes[0],[1,1,false]);
assert.equal(view.width,0);assert.equal(view.height,0,'retain actual size to avoid repeated resizing while hidden');
view.canvas.clientWidth=800;view.canvas.clientHeight=400;View.prototype.resize.call(view);
assert.equal(view.camera.aspect,2);assert.deepEqual(sizes[1],[800,400,false]);
console.log('PASS graphics: denied/null contexts, WebGL fallback and finite hidden-canvas projection');
