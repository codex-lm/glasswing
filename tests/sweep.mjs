// Legal-input coverage, deliberately separate from fast unit regressions.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRun,tick} from '../src/game/run.js';
import {bot} from './bot.mjs';
import {record} from '../src/core/replay.js';
const levels=['landing','canopy','hollow','nest'].map(id=>JSON.parse(readFileSync(`src/data/levels/${id}.json`)));
let stuck=0;
for(const mode of ['solo','coop'])for(const kind of ['brawler','skimmer','spark'])for(const difficulty of ['easy','normal','hard'])for(const seed of ['charles-first-flight','fern','moon']) {
 const s=createRun(levels,{mode,kind,kind2:kind==='spark'?'brawler':'spark',difficulty,seed,rulesVersion:3});
 for(let i=0;i<36000&&s.phase!=='result';i++) {
  tick(s,[bot(s),mode==='coop'?bot(s,1):0]);
  for(const p of s.players)assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.mask),'Finite player state');
 }
 if(s.phase!=='result')stuck++;
 if(process.env.GLASSWING_RECORD_SWEEP&&s.won&&difficulty==='normal'&&seed==='charles-first-flight'){const name=mode==='solo'?'normal-'+kind:kind==='brawler'?'coop-brawler-spark':null;if(name&&name!=='normal-brawler')writeFileSync('tests/replays/'+name+'.json',JSON.stringify(record(s))+'\n');}
 console.log(JSON.stringify({mode,kind,difficulty,seed,won:s.won,result:s.phase==='result',seconds:Math.round(s.frame/60),area:s.area+1,kills:s.players.reduce((n,p)=>n+p.kills,0),lives:s.lives,position:s.players.map(p=>[+p.x.toFixed(1),+p.y.toFixed(1),p.dead])}));
}
console.log(`Unfinished legal-input runs: ${stuck}. A stalled bot is a diagnostic, not automatically a game bug.`);
