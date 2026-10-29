import assert from 'node:assert/strict';
import {Input,B,MENU,gamepadMask} from '../src/core/input.js';
import {navigate} from '../src/ui/navigation.js';
import {Screens} from '../src/ui/screens.js';

class Events {
 constructor(){this.listeners={};this.hidden=false;}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
 emit(name,fields={}){for(const fn of this.listeners[name]||[])fn({target:{matches:()=>false},preventDefault(){},...fields});}
}
const pad=index=>({index,connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))});
let devices=[pad(2)],target=new Events(),doc=new Events();
const input=new Input(target,doc,()=>devices);
target.emit('keydown',{code:'Escape'});target.emit('keyup',{code:'Escape'});input.poll();
assert(input.pausePressed,'a quick pause tap between render frames is retained');
input.poll();assert(!input.pausePressed);
target.emit('keydown',{code:'KeyK'});target.emit('keyup',{code:'KeyK'});input.poll();
assert(input.sample()&B.sword,'a short gameplay tap reaches one simulation step');
assert(!(input.sample()&B.sword));
devices[0].buttons[9].pressed=true;
assert.equal(input.poll(),0,'Start is separate from menu Back');
assert(input.pausePressed);
input.clear();input.poll();
assert(!input.pausePressed,'held Start cannot immediately resume');
devices[0].buttons[9].pressed=false;input.poll();
devices[0].buttons[9].pressed=true;input.poll();
assert(input.pausePressed,'released Start can toggle again');
devices[0].buttons[9].pressed=false;input.poll();

devices[0].buttons[0].pressed=true;
assert.equal(input.poll(),MENU.accept);
input.clear();input.poll();
assert(!(input.sample()&B.jump),'menu confirmation does not leak into gameplay');
devices[0].buttons[0].pressed=false;input.poll();
devices[0].buttons[0].pressed=true;input.poll();
assert(input.sample()&B.jump);
input.multi=true;
target.emit('keydown',{code:'KeyF'});
assert(input.sample(0)&B.attack);
assert(!(input.sample(0)&B.jump));
assert(input.sample(1)&B.jump,'one gamepad controls P2 alongside P1 keyboard');
devices=[null,pad(2),null,pad(6)];
devices[1].buttons[3].pressed=true;devices[3].buttons[1].pressed=true;input.poll();
assert(input.sample(0)&B.sword);
assert(input.sample(1)&B.blast,'sparse two-pad slots retain player ordering');
devices[1].axes=[-.1,.1];
assert.equal(gamepadMask(devices[1]),B.sword,'small stick drift is ignored');
devices[1].axes=[-.8,-.8];input.poll();
assert(gamepadMask(devices[1])&B.left);
devices[1].axes=[0,0];input.poll();
devices[1].buttons[12].pressed=true;
assert(input.poll()&MENU.up,'up navigation is distinct from left');
assert.equal(input.poll(),0,'holding a menu direction does not repeat activation');
target.emit('blur');
assert(!input.keys.size);
target.emit('keydown',{code:'KeyF',repeat:true});
assert(!input.keys.size,'auto-repeat does not revive keys cleared by a transition');
devices=[];input.poll();assert.equal(input.sample(1),0);
input.getPads=()=>{throw new Error('Gamepad API unavailable');};
assert.equal(input.poll(),0);

const page={activeElement:null};
function control(tag,type='') {
 return {tagName:tag,type,options:[{},{}],selectedIndex:0,events:[],clicks:0,value:'.5',
  focus(){page.activeElement=this;},click(){this.clicks++;},
  dispatchEvent(event){this.events.push(event.type);},
  stepUp(){this.value=String(Math.min(1,Number(this.value)+.05));},
  stepDown(){this.value=String(Math.max(0,Number(this.value)-.05));}
 };
}
const first=control('BUTTON'),select=control('SELECT'),range=control('INPUT','range'),last=control('BUTTON');
const items=[first,select,range,last];
const rootEvents={};
const root={ownerDocument:page,children:[],querySelectorAll:()=>items,querySelector:()=>null,
 addEventListener:(type,callback)=>rootEvents[type]=callback};
select.focus();navigate(root,MENU.right);
assert.equal(select.selectedIndex,1);
assert.equal(page.activeElement,select);
assert.deepEqual(select.events,['change']);
navigate(root,MENU.down);assert.equal(page.activeElement,range);
navigate(root,MENU.left);assert.equal(range.value,'0.45');
assert.deepEqual(range.events,['input','change']);
navigate(root,MENU.accept);assert.equal(page.activeElement,last);
first.focus();navigate(root,MENU.accept);
assert.equal(first.clicks,1);assert.equal(last.clicks,0,'activation follows actual focus, never a stale index');
navigate(root,MENU.up);assert.equal(page.activeElement,last,'focus wraps');
const screens=new Screens(root,target);
let cleaned=0,back=0,resumed=0;
screens.cleanup=()=>cleaned++;
screens.show('options','',{back:()=>back++,resume:()=>resumed++});
screens.back();assert.equal(back,1);assert.equal(resumed,0);
assert.equal(cleaned,1,'leaving a screen clears temporary keyboard capture');
screens.show('pause','',{resume:()=>resumed++});
screens.back();assert.equal(resumed,1);
screens.onChange=()=>input.clear();root.children=[{}];
input.multi=false;input.maps.solo.pause=['Enter'];
first.click=()=>screens.show('select','');first.focus();
target.emit('keydown',{code:'Enter'});target.emit('keyup',{code:'Enter'});input.poll();
assert(!input.pausePressed,'a remapped menu confirmation cannot undo its own screen transition');
const menuSounds=[];screens.onCue=name=>menuSounds.push(name);
first.focus();target.emit('keydown',{code:'ArrowRight'});
assert.equal(menuSounds.at(-1),'menu-move');
rootEvents.click({target:{closest:()=>first}});assert.equal(menuSounds.at(-1),'menu-select');
rootEvents.change({target:{matches:()=>true}});assert.equal(menuSounds.at(-1),'menu-move');
screens.show('pause','',{resume:()=>resumed++});screens.back();
assert.equal(menuSounds.at(-1),'menu-select');
first.focus();screens.navigate(MENU.up);assert.equal(menuSounds.at(-1),'menu-move');
console.log('PASS input/menu adapters: held Start, suppressed confirmation, one/two pads, drift, focus, selectors, ranges and cleanup');
