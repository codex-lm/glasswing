import {t} from './i18n.js';
import {createShareCard} from './share-card.js';
import {resultStats,eyeName,duration} from './result-stats.js';
export {resultStats,betterResult} from './result-stats.js';

export function downloadBlob(blob,name) {
 if(!blob)throw new Error('Empty export');
 const link=document.createElement('a'),url=URL.createObjectURL(blob);
 link.href=url;link.download=name;link.style.display='none';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function download(data,name,type='application/json') {
 downloadBlob(new Blob([data],{type}),name);
}

export async function shareCard(state) {
 const canvas=await createShareCard(state);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 downloadBlob(blob,'glasswing-run.png');
}

export function resultsHTML(s) {
 if(s.config.mode==='versus')return `<section class="panel"><h2>${t('matchWon',{player:s.winner+1})}</h2><div class="stats"><strong>${s.scores.join(' : ')}</strong></div><p>${t(s.players[s.winner].kind)} · <span class="swatch" style="--eye:${s.players[s.winner].eye}"></span></p><div class="buttons"><button data-action="retry">${t('retry')}</button><button data-action="replay">${t('exportReplay')}</button><button data-action="home">${t('home')}</button></div></section>`;
 const v=resultStats(s);
 const players=v.players.map((p,i)=>`<span><span class="swatch" style="--eye:${p.eye}"></span> ${v.players.length>1?t(i?'p2':'p1')+' · ':''}${t(p.kind)} · ${eyeName(p.eye)}</span>`).join('　');
 const upgrades=v.players.map((p,i)=>`<p>${t('upgrades')}${v.players.length>1?' · '+t(i?'p2':'p1'):''}: ${p.upgrades.map(key=>t(key)).join(' · ')||t('none')}</p>`).join('');
 return `<section class="panel"><div class="eyebrow">${t('rank')} ${v.rank}</div><h2>${t(s.won?'victory':'defeat')}</h2><p>${players}</p><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">${[['areas',v.areas+'/'+v.areaTotal],['enemiesBeaten',v.kills],['time',duration(v.time)],['survived',v.breaks]].map(([key,value])=>`<div class="card">${t(key)}<strong>${value}</strong></div>`).join('')}</div>${upgrades}<div class="buttons"><button data-action="retry">${t('retry')}</button><button data-action="card">${t('shareCard')}</button><button data-action="replay">${t('exportReplay')}</button><button data-action="home">${t('home')}</button></div><p id="export-status" role="status"></p></section>`;
}
