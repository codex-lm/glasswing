// A legal input-only bot. It reads simulation state like an observation, never changes it.

// Re-run after tuning and keep the exact input recording, not a scripted state snapshot.

import {readFileSync,writeFileSync} from 'node:fs';

import {createRun,tick} from '../src/game/run.js';

import {bot} from './bot.mjs';

import {record} from '../src/core/replay.js';

const levels=['landing','canopy','hollow','nest'].map(id=>JSON.parse(readFileSync(`src/data/levels/${id}.json`)));

const state=createRun(levels,{seed:'charles-first-flight',kind:'brawler',difficulty:'normal'});

let lastPhase='';for(let i=0;i<108000&&state.phase!=='result';i++){tick(state,[bot(state),0]);if(process.env.GLASSWING_TRACE){const phase=state.area+':'+state.phase+':'+state.lock?.wave;if(lastPhase!==phase||i%6000===0){console.log(i,phase,'player',state.players[0].x.toFixed(1),state.players[0].y.toFixed(1),'enemies',state.enemies.filter(e=>!e.dead).map(e=>[e.kind,e.x.toFixed(1),e.y.toFixed(1),e.hp,e.ai]));lastPhase=phase;}}}

console.log(JSON.stringify({phase:state.phase,won:state.won,area:state.area,lives:state.lives,frames:state.frame,seconds:state.frame/60,kills:state.players[0].kills,x:state.players[0].x,mask:state.players[0].mask,enemies:state.enemies.filter(e=>!e.dead).map(e=>({kind:e.kind,x:e.x,y:e.y,hp:e.hp,boss:e.boss}))},null,2));

if(state.won){writeFileSync('tests/replays/normal-brawler.json',JSON.stringify(record(state))+'\n');}else process.exitCode=1;

