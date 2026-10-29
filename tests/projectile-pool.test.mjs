import assert from 'node:assert/strict';
import {createRun} from '../src/game/run.js';
import {spawnBoss,bossTick} from '../src/game/boss.js';
import {fire,hurt} from '../src/core/combat.js';
import {testLevel} from '../src/data/test-level.js';
import {BOSS} from '../src/data/boss.js';

// A free early slot and an unrelated live late slot reproduce the ownership bug.
for(const action of ['slam','barrage']){
 const state=createRun([testLevel]),boss=spawnBoss(state);
 const unrelated=state.projectiles[10];
 Object.assign(unrelated,{active:true,owner:state.players[0].id,y:7,vx:.123,radius:.19,range:13});
 const before={...unrelated};
 boss.ai='attack';boss.action=action;boss.aiTimer=BOSS.active;
 bossTick(state,boss);
 const orb=state.projectiles[0];
 assert.equal(orb.owner,boss.id);
 assert.equal(orb.y,action==='slam'?BOSS.slamY:BOSS.barrageY+(BOSS.active%BOSS.barrageLanes)*BOSS.barrageSpacing);
 assert.deepEqual(unrelated,before,'boss must not redirect an existing player orb');
 if(action==='slam'){assert.equal(orb.radius,BOSS.slamRadius);assert.equal(orb.range,BOSS.slamRange);}

 for(const p of state.projectiles)p.active=true;
 const full=structuredClone(state.projectiles);
 boss.aiTimer=BOSS.active;
 bossTick(state,boss);
 assert.deepEqual(state.projectiles,full,'pool exhaustion must not transform any existing orb');
 const player=state.players[0],energy=player.energy;
 assert(!fire(state,player));
 assert.equal(player.energy,energy,'a full pool cannot spend energy without firing');
}

const state=createRun([testLevel]),p=state.players[0];
const first=fire(state,p),ids=first.hitIds;
first.hitIds.push(99);first.active=false;
assert.equal(fire(state,p),first,'reuse the free projectile slot');
assert.equal(first.hitIds,ids,'reuse hit tracking storage');
assert.equal(ids.length,0,'old targets do not survive recycling');
p.blocking=true;p.grounded=true;p.blockAge=0;
const source={x:p.x+1,team:2};
hurt(state,p,source,1,{projectile:first,impactX:p.x+1});
assert.equal(first.hitIds,ids,'reflection also clears in place');
console.log('PASS projectile pool: exact boss orb ownership, exhaustion, energy and recycled hit tracking');
