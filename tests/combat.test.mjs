import assert from 'node:assert/strict';
import {createRun,tick} from '../src/game/run.js';
import {entity} from '../src/core/entity.js';
import {hurt,heal,damageFor,fire,projectilesTick} from '../src/core/combat.js';
import {testLevel} from '../src/data/test-level.js';
import {MOVES} from '../src/data/moves.js';
const s=createRun([testLevel]);const p=s.players[0],enemy=entity(2,'brawler',4,1,2);p.x=3;p.y=1;p.grounded=true;p.blocking=true;p.blockAge=6;
assert.equal(hurt(s,p,enemy),'block');assert.equal(p.energy,5);assert.equal(p.mask,6);
p.blockAge=5;assert.equal(hurt(s,p,enemy),'parry');assert.equal(enemy.stun,60);assert(enemy.vulnerable);assert.equal(p.energy,6);
p.blockAge=6;p.energy=0;hurt(s,p,enemy);assert.equal(p.mask,5);hurt(s,p,enemy);assert.equal(p.mask,5,'invincibility');
p.inv=0;p.blocking=false;p.mask=1;hurt(s,p,enemy);assert(p.glass);assert.equal(damageFor(p,'punch'),9);heal(p,1);assert(!p.glass);assert.equal(p.survived,1);
p.glass=true;p.mask=0;p.inv=0;p.blocking=true;p.blockAge=9;assert.equal(hurt(s,p,enemy),'parry');p.blockAge=10;p.energy=0;assert.equal(hurt(s,p,enemy),'hit');assert(p.dead);
const r=createRun([testLevel]);const a=r.players[0],b=entity(3,'spark',4,1,2);a.x=3;a.y=1;a.grounded=true;a.blocking=true;a.blockAge=0;b.facing=-1;r.enemies.push(b);fire(r,b,false,true);const orb=r.projectiles.find(q=>q.active);orb.x=3.35;projectilesTick(r,[a,b]);assert.equal(orb.team,0);assert(orb.vx>0);assert.equal(orb.color,a.eye);assert.equal(b.stun,60);
for(const m of Object.values(MOVES)){assert(m.startup<=8);assert(m.total<=24);assert.equal(m.frames.length,m.total);}
console.log('PASS combat: guard, guard break, exact parry bounds, stun, reflection, immunity, glass damage, heal, fatal hit; frame pace');
