import {PAD} from '../data/controls.js';
export const B={left:1,right:2,down:4,jump:8,attack:16,sword:32,blast:64,dodge:128,block:256,pause:512};
export const DEFAULT_KEYS={solo:{left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD'],down:['ArrowDown','KeyS'],jump:['Space','KeyW','ArrowUp'],attack:['KeyJ'],sword:['KeyK'],blast:['KeyL'],dodge:['ShiftLeft','ShiftRight','KeyI'],block:['KeyU','ControlLeft','ControlRight'],pause:['Escape','KeyP']},p1:{left:['KeyA'],right:['KeyD'],down:['KeyS'],jump:['Space','KeyW'],attack:['KeyF'],sword:['KeyG'],blast:['KeyH'],dodge:['KeyR'],block:['KeyT'],pause:['Escape','KeyP']},p2:{left:['ArrowLeft'],right:['ArrowRight'],down:['ArrowDown'],jump:['ArrowUp'],attack:['KeyJ'],sword:['KeyK'],blast:['KeyL'],dodge:['ShiftLeft','ShiftRight'],block:['KeyI'],pause:['Escape','KeyP']}};
export function edge(mask,previous,bit){return !!(mask&bit)&&!(previous&bit);}
export const MENU={left:1,right:2,up:4,down:8,accept:16,back:32};

export function gamepadMask(pad) {
  if (!pad) return 0;
  let mask=0;
  const down=n=>!!pad.buttons[n]?.pressed;
  if (pad.axes[0]<-PAD.moveDeadZone||down(14)) mask|=B.left;
  if (pad.axes[0]>PAD.moveDeadZone||down(15)) mask|=B.right;
  if (pad.axes[1]>PAD.verticalDeadZone||down(13)) mask|=B.down;
  for (const [button,action] of PAD.buttons) if (down(button)) mask|=B[action];
  return mask;
}

export class Input {
  constructor(target=window,doc=document,getPads=()=>navigator.getGamepads?.()||[]) {
    this.keys=new Set();
    this.maps=structuredClone(DEFAULT_KEYS);
    this.touch=[0,0];this.pulses=[0,0];this.multi=false;
    this.pads=[];this.suppressed=new Map();this.getPads=getPads;
    this.padMenu=0;this.pauseHeld=false;this.pausePressed=false;
    target.addEventListener('keydown',e=>{
      if (e.repeat||e.target.matches('input,select,textarea')&&e.code!=='Escape') return;
      this.keys.add(e.code);
      for(let index=0;index<(this.multi?2:1);index++){
        const map=this.maps[this.multi?(index?'p2':'p1'):'solo'];
        for(const [action,codes] of Object.entries(map))if(codes.includes(e.code))this.pulses[index]|=B[action];
      }
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&!e.altKey) e.preventDefault();
    });
    target.addEventListener('keyup',e=>this.keys.delete(e.code));
    target.addEventListener('blur',()=>this.clear());
    doc.addEventListener('visibilitychange',()=>{if(doc.hidden)this.clear();});
  }

  clear() {
    this.keys.clear();this.touch.fill(0);this.pulses.fill(0);
    // Menu confirmation must not become a held jump or attack on the new screen.
    for (const pad of this.pads) this.suppressed.set(pad.index,gamepadMask(pad));
    // Keep the pause/menu latches: holding Start may only toggle once.
  }

  poll() {
    this.pads.length=0;
    try {for(const pad of this.getPads())if(pad?.connected!==false&&pad)this.pads.push(pad);} catch {}
    let value=0,paused=false;
    for (const pad of this.pads) {
      const button=n=>!!pad.buttons[n]?.pressed,zone=PAD.menuDeadZone;
      if(pad.axes[0]<-zone||button(14))value|=MENU.left;
      if(pad.axes[0]>zone||button(15))value|=MENU.right;
      if(pad.axes[1]<-zone||button(12))value|=MENU.up;
      if(pad.axes[1]>zone||button(13))value|=MENU.down;
      if(button(0))value|=MENU.accept;
      if(button(1))value|=MENU.back;
      if(button(9))paused=true;
      this.suppressed.set(pad.index,(this.suppressed.get(pad.index)||0)&gamepadMask(pad));
    }
    for(const layout of this.multi?['p1','p2']:['solo']) {
      if(this.maps[layout].pause.some(code=>this.keys.has(code)))paused=true;
    }
    if((this.touch[0]|this.touch[1]|this.pulses[0]|this.pulses[1])&B.pause)paused=true;
    this.pulses[0]&=~B.pause;this.pulses[1]&=~B.pause;
    this.pausePressed=paused&&!this.pauseHeld;
    this.pauseHeld=paused;
    const pressed=value&~this.padMenu;
    this.padMenu=value;
    return pressed;
  }

  sample(index=0) {
    let mask=this.touch[index]|this.pulses[index];
    this.pulses[index]=0;
    const map=this.maps[this.multi?(index?'p2':'p1'):'solo'];
    for(const [action,codes] of Object.entries(map))if(codes.some(code=>this.keys.has(code)))mask|=B[action];
    // One pad supplements the P1 keyboard; with two pads their order maps to P1/P2.
    const pad=this.pads[this.multi&&this.pads.length===1?index-1:index];
    if(pad)mask|=gamepadMask(pad)&~(this.suppressed.get(pad.index)||0);
    return mask;
  }
}
