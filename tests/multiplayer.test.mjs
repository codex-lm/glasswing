import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRun,tick,offer,choose} from '../src/game/run.js';
import {coopTick} from '../src/game/coop.js';
import {versusFlow,arenaHazards} from '../src/game/versus.js';
import {damageFor,fire} from '../src/core/combat.js';
import {spawnEnemy} from '../src/game/enemies/wild.js';
import {levels} from './levels.test.mjs';
const arenas=['clearing','canopy','hollow'].map(id=>JSON.parse(readFileSync(`src/data/levels/arenas/${id}.json`)));
const all=levels.concat(arenas);
for(const kind of ['brawler','skimmer','spark']){const s=createRun(levels,{kind});assert.equal(s.players[0].kind,kind);assert(damageFor(s.players[0],'blast')>0);}
const c=createRun(all,{mode:'coop'});assert.equal(c.lives,4);assert.equal(c.players.length,2);assert.equal(c.players[0].team,c.players[1].team);assert.equal(spawnEnemy(c,{kind:'brawler',x:8}).hp,9);
c.players[0].x=3;c.players[0].y=1;c.players[0].vx=0;c.players[1].x=3.5;c.players[1].y=1;c.players[1].dead=true;for(let i=0;i<119;i++)coopTick(c);assert(c.players[1].dead);coopTick(c);assert(!c.players[1].dead);assert.equal(c.players[0].mask,5);assert.equal(c.players[1].mask,1);
c.players[1].x=40;coopTick(c);assert(Math.abs(c.players[1].x-c.players[0].x)<=13);offer(c);choose(c,0);assert.equal(c.phase,'altar');assert.equal(c.altarPlayer,1);choose(c,1);assert.equal(c.area,1);assert.equal(c.players[0].upgrades.length,1);assert.equal(c.players[1].upgrades.length,1);
const v=createRun(all,{mode:'versus',arena:'arena-clearing'});assert.equal(v.level.width,18);assert.notEqual(v.players[0].team,v.players[1].team);v.players[1].dead=true;versusFlow(v);assert.deepEqual(v.scores,[1,0]);for(let i=0;i<60;i++)tick(v,[0,0]);assert.equal(v.round,2);assert.equal(v.phase,'playing');v.players[1].dead=true;versusFlow(v);assert.equal(v.phase,'result');assert.equal(v.winner,0);
const h=createRun(all,{mode:'versus',arena:'arena-hollow'});h.players[0].x=6.5;h.players[0].grounded=true;arenaHazards(h);assert(h.players[0].vy>0);console.log('PASS M2: three kinds, local teams, +50% HP, exact 2s revive/cost, leash, individual altar choices, best of three, mushroom hazard');
for(const mode of ['coop','versus']){const a=createRun(all,{mode,kind:'spark',kind2:'skimmer'}),b=createRun(all,{mode,kind:'spark',kind2:'skimmer'});for(let f=0;f<1800;f++){const inputs=[(f%80<40?2:1)|(f%25===0?32:0)|(f%50<20?8:0),(f%90<45?1:2)|(f%30===0?16:0)|(f%70<15?8:0)];tick(a,inputs);tick(b,inputs);}assert.deepEqual(a,b);}console.log('PASS 1,800-frame two-player deterministic runs in both modes');
const trade=createRun(all,{mode:'versus',arena:'arena-canopy',kind2:'brawler'});for(const [i,p] of trade.players.entries()){p.x=8+i*.7;p.y=1;p.mask=0;p.glass=true;p.grounded=true;p.move='punch1';p.moveFrame=3;p.facing=i?-1:1;}tick(trade,[0,0]);tick(trade,[0,0]);assert(trade.players.every(p=>p.dead),'same-frame attacks trade');assert.equal(trade.roundWinner,-1);assert.deepEqual(trade.scores,[0,0]);
