import {MENU} from '../core/input.js';

export function controls(root) {
  return [...root.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled):not([type="hidden"]),a[href]')];
}

export function focusStep(items,active,direction) {
  if(!items.length)return;
  const index=Math.max(0,items.indexOf(active));
  items[(index+direction+items.length)%items.length].focus();
}

export function adjustControl(control,direction) {
  if(control?.tagName==='SELECT'){
    if(!control.options.length)return false;
    control.selectedIndex=(control.selectedIndex+direction+control.options.length)%control.options.length;
    control.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  }
  if(control?.tagName==='INPUT'&&control.type==='range'){
    if(direction>0)control.stepUp();else control.stepDown();
    control.dispatchEvent(new Event('input',{bubbles:true}));
    control.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  }
  return false;
}

export function navigate(root,menu) {
  const items=controls(root),active=root.ownerDocument.activeElement;
  if(!items.length)return;
  // Vertical navigation always leaves a selector; horizontal input edits its value.
  if(menu&(MENU.up|MENU.down))focusStep(items,active,menu&MENU.up?-1:1);
  else if(menu&(MENU.left|MENU.right)){
    const direction=menu&MENU.left?-1:1;
    if(!adjustControl(active,direction))focusStep(items,active,direction);
  }else if(menu&MENU.accept){
    const current=items.includes(active)?active:items[0];
    if(current.tagName==='SELECT'||current.tagName==='INPUT'&&current.type!=='file')focusStep(items,current,1);
    else current.click();
  }
}
