import assert from 'node:assert/strict';
import {createRun,tick} from '../src/game/run.js';
import {record,validateReplay} from '../src/core/replay.js';
import {levels} from './levels.test.mjs';
import {B} from '../src/core/input.js';
const s=createRun(levels,{seed:'determinism'});for(let i=0;i<2400;i++)tick(s,[(i%70<40?B.right:0)|(i%30===0?B.sword:0)|(i%90<24?B.jump:0),0]);const replay=validateReplay(record(s));const copy=createRun(levels,replay.config);for(const [count,a,b] of replay.inputs)for(let i=0;i<count;i++)tick(copy,[a,b]);assert.deepEqual(copy,s);console.log('PASS deterministic seed + input replay (2,400 frames)');
