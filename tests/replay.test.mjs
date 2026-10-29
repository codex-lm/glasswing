import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRun,tick} from '../src/game/run.js';
import {record,validateReplay} from '../src/core/replay.js';
import {levels} from './levels.test.mjs';
import {B} from '../src/core/input.js';
const s=createRun(levels,{seed:'determinism'});for(let i=0;i<2400;i++)tick(s,[(i%70<40?B.right:0)|(i%30===0?B.sword:0)|(i%90<24?B.jump:0),0]);const replay=validateReplay(record(s));const copy=createRun(levels,replay.config);for(const [count,a,b] of replay.inputs)for(let i=0;i<count;i++)tick(copy,[a,b]);assert.deepEqual(copy,s);console.log('PASS deterministic seed + input replay (2,400 frames)');
const full=validateReplay(JSON.parse(readFileSync('tests/replays/normal-brawler.json')));const run=createRun(levels,full.config);for(const [n,a,b] of full.inputs)for(let i=0;i<n;i++)tick(run,[a,b]);assert.equal(run.config.kind,'brawler');assert.equal(run.config.difficulty,'normal');assert(run.won);assert.equal(run.areasCleared,4);assert.equal(run.phase,'result');console.log(`PASS full Normal Brawler replay: ${run.frame} frames, ${run.players[0].kills} defeats, ${run.lives} remaining life`);

for(const name of ['normal-skimmer','normal-spark','coop-brawler-spark']){
 const replay=validateReplay(JSON.parse(readFileSync('tests/replays/'+name+'.json'))),s=createRun(levels,replay.config);
 for(const [count,a,b] of replay.inputs)for(let i=0;i<count;i++)tick(s,[a,b]);
 assert(s.won,name+' completes all four areas');assert.equal(s.areasCleared,4);assert.equal(s.phase,'result');
 console.log(`PASS full ${name} replay: ${s.frame} frames, ${s.lives} remaining lives`);
}
