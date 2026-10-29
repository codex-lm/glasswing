import {t} from './i18n.js';
import {controls,focusStep,navigate} from './navigation.js';

export class Screens {
 constructor(root,target=window) {
  this.root=root;this.name='title';this.actions={};this.revision=0;this.cleanup=null;
  target.addEventListener('keydown',e=>{
   if(!this.root.children.length||e.target.matches('input,select,textarea'))return;
   const items=controls(this.root);
   if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Tab'].includes(e.code)){
    if(!items.length)return;
    e.preventDefault();
    focusStep(items,this.root.ownerDocument.activeElement,['ArrowLeft','ArrowUp'].includes(e.code)||e.shiftKey?-1:1);
   }else if(e.code==='Space'||e.code==='Enter'){
    e.preventDefault();
    const active=this.root.ownerDocument.activeElement;
    (items.includes(active)?active:items[0])?.click();
   }
  });
 }

 leave() {
  this.cleanup?.();this.cleanup=null;
  this.onChange?.();
  this.revision++;
 }

 show(name,html,actions={}) {
  this.leave();this.name=name;this.actions=actions;this.root.innerHTML=html;
  for(const [id,fn] of Object.entries(actions))this.root.querySelector(`[data-action="${id}"]`)?.addEventListener('click',fn);
  controls(this.root)[0]?.focus({preventScroll:true});
 }

 clear() {
  this.leave();this.name='playing';this.actions={};this.root.innerHTML='';
  this.root.ownerDocument.activeElement?.blur();
 }

 navigate(menu){navigate(this.root,menu);}
 back(){(this.actions.back||this.actions.resume||this.actions.home)?.();}

 title(actions,noWebGL=false) {
  this.show('title',`<section class="panel title"><div class="eyebrow">${t('byline')}</div><h1>${t('title')}</h1><p class="lead">${t('tagline')}</p><div class="buttons">${['play','twoPlayers','options','howto'].map(id=>`<button data-action="${id}" class="${id==='play'?'primary':''}">${t(id)}</button>`).join('')}</div>${noWebGL?`<p class="status">${t('noWebGL')}</p>`:''}<div class="credit">${t('credit')}</div></section>`,actions);
 }

 simple(name,text,back) {
  this.show(name,`<section class="panel"><h2>${t(name)}</h2><p>${text}</p><button data-action="back">${t('back')}</button></section>`,{back});
 }
}
