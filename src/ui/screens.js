import {t} from './i18n.js';

export class Screens{

 constructor(root){this.root=root;this.focus=0;this.name='title';window.addEventListener('keydown',e=>{if(!this.root.children.length||e.target.matches('input,select,textarea'))return;const buttons=[...this.root.querySelectorAll('button:not(:disabled),select,input,a')];if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Tab'].includes(e.code)){e.preventDefault();if(!buttons.length)return;this.focus=Math.max(0,buttons.indexOf(document.activeElement));this.focus=(this.focus+(['ArrowLeft','ArrowUp'].includes(e.code)||e.shiftKey?-1:1)+buttons.length)%buttons.length;buttons[this.focus]?.focus();}if((e.code==='Space'||e.code==='Enter')){e.preventDefault();(e.target.tagName==='BUTTON'?e.target:buttons[this.focus])?.click();}});}

 show(name,html,actions={}){this.name=name;this.focus=0;this.root.innerHTML=html;for(const [id,fn] of Object.entries(actions))this.root.querySelector(`[data-action="${id}"]`)?.addEventListener('click',fn);this.root.querySelector('button,select,input,a')?.focus({preventScroll:true});}

 clear(){this.name='playing';this.root.innerHTML='';document.activeElement?.blur();}

 title(actions,noWebGL=false){this.show('title',`<section class="panel title"><div class="eyebrow">${t('byline')}</div><h1>${t('title')}</h1><p class="lead">${t('tagline')}</p><div class="buttons">${['play','twoPlayers','options','howto'].map(id=>`<button data-action="${id}" class="${id==='play'?'primary':''}">${t(id)}</button>`).join('')}</div>${noWebGL?`<p class="status">${t('noWebGL')}</p>`:''}<div class="credit">${t('credit')}</div></section>`,actions);}

 simple(name,text,back){this.show(name,`<section class="panel"><h2>${t(name)}</h2><p>${text}</p><button data-action="back">${t('back')}</button></section>`,{back});}

}

