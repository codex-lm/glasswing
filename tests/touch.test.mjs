import assert from 'node:assert/strict';
import {TouchControls} from '../src/ui/touch.js';
import {B} from '../src/core/input.js';

const originals=new Map(['window','document','matchMedia','performance','setTimeout','clearTimeout']
 .map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
const timers=new Map(),events={};let timerId=0,now=10;
const classes=()=>({values:new Set(),add(key){this.values.add(key);},remove(key){this.values.delete(key);}});
const button=action=>({dataset:{touch:action},classList:classes(),setPointerCapture(){}});
const buttons=['jump','attack','sword','blast'].map(button);
const pad={setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})};
const root={innerHTML:'',querySelector:selector=>selector==='.touch-pad'?pad:{},querySelectorAll:()=>buttons};
const doc={hidden:false,body:{classList:classes()},querySelector:()=>root,addEventListener:(key,fn)=>events[key]=fn};
const win={addEventListener:(key,fn)=>events[key]=fn};
for(const [key,value] of Object.entries({window:win,document:doc,matchMedia:()=>({matches:true}),
 performance:{now:()=>now},setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)}))
 Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
const pointer=(id,x=50,y=50)=>({pointerId:id,clientX:x,clientY:y,preventDefault(){}});
const advance=()=>{for(const [id,fn] of [...timers]){timers.delete(id);fn();}};
try{
 const input={touch:[0,0],pulses:[0,0]},touch=new TouchControls(input,{touch:'on'},()=>{});
 touch.visible(true);
 pad.onpointerdown(pointer(1,90));
 assert.equal(input.pulses[0]&B.dodge,0,'the first tap is never a double tap');
 pad.onpointerdown(pointer(2,10));
 assert.equal(input.touch[0]&(B.left|B.right),B.right,'a second finger cannot take the movement pad');
 pad.onpointerup(pointer(2));assert(input.touch[0]&B.right,'unrelated releases do not clear movement');
 pad.onpointerup(pointer(1));assert.equal(input.touch[0],0);
 now=150;pad.onpointerdown(pointer(3,90));assert(input.pulses[0]&B.dodge);
 pad.onpointercancel(pointer(3));input.pulses[0]=0;
 now=200;pad.onpointerdown(pointer(4,90));assert.equal(input.pulses[0]&B.dodge,0,'canceled gestures do not count toward a dash');
 touch.clear();

 const [jump,attack,sword,blast]=buttons;
 attack.onpointerdown(pointer(10));attack.onpointerdown(pointer(11));
 assert.equal(timers.size,1,'one finger owns each attack timer');
 attack.onpointerup(pointer(11));assert.equal(timers.size,1);
 attack.onpointerup(pointer(10));advance();
 assert.equal(input.touch[0]&B.block,0,'release cannot leave an orphan guard timer');
 assert(input.pulses[0]&B.attack,'a short tap still attacks');
 input.pulses[0]=0;attack.onlostpointercapture(pointer(10));assert.equal(input.pulses[0],0);

 attack.onpointerdown(pointer(12));advance();assert(input.touch[0]&B.block);
 attack.onpointerup(pointer(12));assert.equal(input.touch[0],0);assert.equal(input.pulses[0],0,'guard release does not punch');
 jump.onpointerdown(pointer(20));sword.onpointerdown(pointer(21));
 assert.equal(input.touch[0],B.jump|B.sword,'different controls remain simultaneous');
 jump.onpointerup(pointer(21));assert(input.touch[0]&B.jump);
 jump.onpointercancel(pointer(20));assert.equal(input.pulses[0]&B.jump,0);
 assert(input.touch[0]&B.sword);sword.onpointerup(pointer(21));
 touch.clear();
 blast.onpointerdown(pointer(22));blast.onpointerup(pointer(22));
 assert.equal(input.touch[0],0);assert(input.pulses[0]&B.blast,'a quick blast tap survives until sampling');
 touch.clear();blast.onpointerdown(pointer(23));blast.onpointercancel(pointer(23));
 assert.equal(input.touch[0]|input.pulses[0],0,'canceled blast input is not buffered');

 attack.onpointerdown(pointer(30));events.blur();advance();
 attack.onpointerup(pointer(30));assert.equal(input.touch[0]|input.pulses[0],0,'blur cancels future releases and timers');
 assert.equal(attack.classList.values.size,0);
 attack.onpointerdown(pointer(31));doc.hidden=true;events.visibilitychange();advance();
 assert.equal(input.touch[0]|input.pulses[0],0,'hidden pages cancel touch state');
 doc.hidden=false;
 attack.onpointerdown(pointer(32));touch.visible(false);advance();
 attack.onpointerup(pointer(32));assert.equal(input.touch[0]|input.pulses[0],0,'menu transitions cancel stale input');
 assert.equal(root.innerHTML,'');assert(!doc.body.classList.values.has('touch-active'));
 touch.visible(true);now=205;pad.onpointerdown(pointer(40,90));
 assert.equal(input.pulses[0]&B.dodge,0,'a tap before the menu cannot become a double tap afterward');
}finally{
 for(const [key,descriptor] of originals)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
}
console.log('PASS touch adapters: pointer ownership, true double taps, simultaneous controls, guard timers and cancellation');
