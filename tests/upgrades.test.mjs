import assert from 'node:assert/strict';
import {createRun,offer,choose} from '../src/game/run.js';
import {levels} from './levels.test.mjs';
import {entity} from '../src/core/entity.js';
import {damageFor,heal,hurt} from '../src/core/combat.js';
import {energyMax} from '../src/data/feel.js';
const p=entity(1);p.upgrades=['heavyFists','glassHeart','deepReserve'];p.glass=true;assert.equal(damageFor(p,'punch'),16);assert.equal(energyMax(p),8);p.upgrades.push('secondMask');const s=createRun(levels);p.mask=0;s.players=[p];hurt(s,p,{x:4,team:2,eye:'#888888'},1);assert(!p.dead);assert.equal(p.mask,1);assert(p.secondUsed);
const run=createRun(levels,{rulesVersion:3});const offered=new Set();for(let i=0;i<4;i++){offer(run);for(const key of run.choices){assert(!offered.has(key));offered.add(key);}}assert.equal(offered.size,12);console.log('PASS stacked upgrades, extra energy capacity, one-use Second Mask, non-repeating offers');
