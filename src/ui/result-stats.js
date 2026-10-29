import {F,EYES} from '../data/feel.js';
import {RESULTS as R} from '../data/results.js';
import {t} from './i18n.js';

const eyeNames=['orange','cyan','green','violet','red','yellow','pink','white'];
export const eyeName=eye=>t(eyeNames[EYES.indexOf(eye)]||'white');
export const duration=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');

export function resultStats(s) {
 const p=s.players[0],kills=s.players.reduce((sum,p)=>sum+p.kills,0);
 const breaks=s.players.reduce((sum,p)=>sum+p.survived,0);
 const score=kills*R.killScore+s.areasCleared*R.areaScore+breaks*R.survivalScore+Math.max(0,s.lives)*R.lifeScore;
 return {
  won:s.won,areas:s.areasCleared,areaTotal:s.levels.length,score,kills,time:Math.floor(s.frame/F.hz),
  rank:!s.won?'C':score>F.rankS?'S':score>F.rankA?'A':'B',
  kind:p.kind,eye:p.eye,breaks,upgrades:[...p.upgrades],
  players:s.players.map(p=>({kind:p.kind,eye:p.eye,glass:p.glass,mask:p.mask,maxMask:p.maxMask,upgrades:[...p.upgrades]}))
 };
}

// A later loss must never erase a winning personal best. Equal scores favour speed.
export function betterResult(candidate,previous) {
 return !previous||Number(candidate.won)>Number(previous.won)||candidate.won===previous.won&&
  (candidate.score>previous.score||candidate.score===previous.score&&candidate.time<previous.time);
}
