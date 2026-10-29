import {F,energyMax} from '../data/feel.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';
import {t} from './i18n.js';

const painted=new WeakMap();

export function hudMarkup(s){
 return s.players.map((p,i)=>{
  const maximum=energyMax(p),energy=Math.max(0,Math.min(maximum,p.energy));
  const label=p.dead?t('downed'):p.glass?t('glass'):t('mask');
  const value=p.dead?Math.floor(p.revive/F.revive*100)+'%':p.glass?
   '×'+(p.upgrades.includes('glassHeart')?U.glassHeart:F.glassMultiplier):
   Math.ceil(p.mask)+' / '+p.maxMask;
  const name=t(p.kind)+(s.players.length>1?' · '+t(i?'p2':'p1'):'');
  const progress=s.config.mode==='versus'?t('round')+' '+s.round+' · '+s.scores.join(' : '):t('lives')+' '+s.lives;
  return `<div class="hudbox"><span class="swatch" style="--eye:${p.eye}"></span> ${name}<div class="row">${label} <strong>${value}</strong></div><div class="hudbar" role="meter" aria-label="${t('energy')}" aria-valuemin="0" aria-valuemax="${maximum}" aria-valuenow="${energy}"><span style="width:${energy/maximum*100}%"></span></div><small>${t('energy')} · ${progress}</small></div>`;
 }).join('');
}

export function hud(s){
 const node=document.querySelector('#hud'),markup=hudMarkup(s);
 // The 10 Hz HUD check need not recreate unchanged DOM. A cleared title invalidates it.
 if(painted.get(node)!==markup||node.childElementCount!==s.players.length){
  node.innerHTML=markup;painted.set(node,markup);
 }
 document.querySelector('#glass-border').classList.toggle('active',s.players.some(p=>p.glass&&!p.dead));
}
