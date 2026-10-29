import {B} from '../core/input.js';
import {TOUCH} from '../data/controls.js';
import {t} from './i18n.js';

const directionBits=B.left|B.right|B.down;
export function touchDirection(x,y){
 return (x<-TOUCH.deadZone?B.left:x>TOUCH.deadZone?B.right:0)|(y>TOUCH.downZone?B.down:0);
}

export class TouchControls {
 constructor(input,settings,onPause){
  this.input=input;this.settings=settings;this.onPause=onPause;
  this.root=document.querySelector('#touch');
  this.seen=matchMedia('(pointer:coarse)').matches;
  this.lastTap=-Infinity;this.pad=null;this.active=false;this.buttons=[];
  window.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')this.seen=true;});
  window.addEventListener('blur',()=>this.clear());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
 }

 clear(){
  this.input.touch[0]=0;this.input.pulses[0]=0;
  this.pad=null;this.lastTap=-Infinity;
  for(const state of this.buttons){
   clearTimeout(state.timer);state.timer=null;state.pointer=null;state.guard=false;
   state.button.classList.remove('held');
  }
 }

 visible(playing){
  const show=playing&&(this.settings.touch==='on'||this.settings.touch!=='off'&&this.seen);
  if(this.active===show)return;
  this.active=show;this.clear();this.buttons=[];
  if(!show){this.root.innerHTML='';document.body.classList.remove('touch-active');return;}
  document.body.classList.add('touch-active');
  this.root.innerHTML=`<button class="touch-pause" aria-label="${t('pause')}">Ⅱ</button><div class="touch-pad" role="group" aria-label="${t('touchMove')}"><span>←　↓　→</span><small>${t('touchDodge')}</small></div><div class="touch-buttons">${[['jump','touchJump'],['attack','touchAttack'],['sword','touchSword'],['blast','touchBlast']].map(([action,label])=>`<button data-touch="${action}">${t(label)}</button>`).join('')}</div><div class="touch-help">${t('touchHelp')}</div>`;
  this.root.querySelector('.touch-pause').onclick=this.onPause;
  this.bindPad(this.root.querySelector('.touch-pad'));
  for(const button of this.root.querySelectorAll('[data-touch]'))this.bindButton(button);
 }

 bindPad(pad){
  pad.onpointerdown=event=>{
   // The first finger owns a control until release; another finger can use other controls.
   if(this.pad)return;
   event.preventDefault();pad.setPointerCapture(event.pointerId);
   const rect=pad.getBoundingClientRect();
   this.pad={id:event.pointerId,x:rect.left+rect.width/2,y:rect.top+rect.height/2};
   const now=performance.now();
   if(now-this.lastTap<TOUCH.doubleTapMs)this.input.pulses[0]|=B.dodge;
   this.lastTap=now;this.movePad(event);
  };
  pad.onpointermove=event=>this.movePad(event);
  const release=(event,cancel=false)=>{
   if(this.pad?.id!==event.pointerId)return;
   this.pad=null;this.input.touch[0]&=~directionBits;
   if(cancel){this.lastTap=-Infinity;this.input.pulses[0]&=~B.dodge;}
  };
  pad.onpointerup=event=>release(event);
  pad.onpointercancel=event=>release(event,true);
  pad.onlostpointercapture=event=>release(event,true);
 }

 movePad(event){
  if(this.pad?.id!==event.pointerId)return;
  this.input.touch[0]=(this.input.touch[0]&~directionBits)|
   touchDirection(event.clientX-this.pad.x,event.clientY-this.pad.y);
 }

 bindButton(button){
  const action=button.dataset.touch,bit=B[action];
  const state={button,pointer:null,guard:false,timer:null};
  this.buttons.push(state);
  button.onpointerdown=event=>{
   if(state.pointer!==null)return;
   event.preventDefault();state.pointer=event.pointerId;
   button.setPointerCapture(event.pointerId);button.classList.add('held');
   if(action==='attack'){
    state.guard=false;
    state.timer=setTimeout(()=>{
     state.timer=null;
     if(state.pointer===null||!this.active)return;
     state.guard=true;this.input.touch[0]|=B.block;
    },TOUCH.guardMs);
   }else{
    this.input.touch[0]|=bit;
    // Buffer even a brief blast tap until the fixed-step simulation can sample it.
    this.input.pulses[0]|=bit;
   }
  };
  const release=(event,cancel=false)=>{
   if(state.pointer!==event.pointerId)return;
   state.pointer=null;button.classList.remove('held');
   if(action==='attack'){
    clearTimeout(state.timer);state.timer=null;
    if(!state.guard&&!cancel)this.input.pulses[0]|=B.attack;
    this.input.touch[0]&=~B.block;state.guard=false;
   }else this.input.touch[0]&=~bit;
   if(cancel)this.input.pulses[0]&=~bit;
  };
  button.onpointerup=event=>release(event);
  button.onpointercancel=event=>release(event,true);
  button.onlostpointercapture=event=>release(event,true);
 }
}
