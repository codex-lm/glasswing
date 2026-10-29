import assert from 'node:assert/strict';
import {AUDIO,SOUND_CUES} from '../src/data/audio.js';
import {emitSound} from '../src/core/sound.js';
import {createRun,tick} from '../src/game/run.js';
import {entity} from '../src/core/entity.js';
import {startMove,attackTick,hurt} from '../src/core/combat.js';
import {testLevel} from '../src/data/test-level.js';
import {MOVES} from '../src/data/moves.js';
import {B} from '../src/core/input.js';

const quietLevel={...structuredClone(testLevel),waves:[]};
const state=createRun([quietLevel],{mode:'versus'}),[attacker,target]=state.players;
Object.assign(attacker,{x:4,y:1,grounded:true,facing:1});
Object.assign(target,{x:5,y:1,grounded:true,mask:1,inv:0});
startMove(attacker,'sword');attacker.moveFrame=MOVES.sword.startup;
attackTick(state,attacker,state.players);
assert(target.glass);
assert(state.audioEvents.includes('mask-shatter'),'sword contact cannot overwrite the mask warning');
assert(state.audioEvents.includes('sword-hit'));
assert(state.audioEvents.includes('sword-swing'));
state.hitStop=2;tick(state,[0,0]);
assert.deepEqual(state.audioEvents,[],'hit stop must not replay last frame cues');

for(const move of ['punch1','punch2','punch3','kick','divekick','sword','downsword']){
 for(const quick of [false,true]){
  const s=createRun([quietLevel]),p=s.players[0],heard=[];
  if(quick)p.upgrades.push('quickHands');
  startMove(p,move);
  while(p.move){s.audioEvents.length=0;attackTick(s,p,[]);heard.push(...s.audioEvents);}
  assert.deepEqual(heard,[MOVES[move].stat==='sword'?'sword-swing':move],move+' has one active-window cue even on a miss');
 }
}
const pogo=createRun([quietLevel]),p=pogo.players[0],enemy=entity(10,'brawler',4,1,2);
Object.assign(p,{x:4,y:2,grounded:false});
startMove(p,'downsword');p.moveFrame=MOVES.downsword.startup;
attackTick(pogo,p,[enemy]);assert(pogo.audioEvents.includes('pogo'));

const damaged=createRun([quietLevel]),victim=damaged.players[0],source=entity(9,'brawler',5,1,2);
const cracks=new Set();
for(let i=0;i<victim.maxMask;i++){
 victim.inv=0;damaged.audioEvents.length=0;hurt(damaged,victim,source,1);
 for(const name of damaged.audioEvents)cracks.add(name);
}
for(const name of ['player-hit','mask-crack1','mask-crack2','mask-crack3','mask-shatter'])assert(cracks.has(name),name);

const walking=createRun([quietLevel]),walker=walking.players[0],steps=new Set();
walker.y=walker.py=1;walker.grounded=true;
for(let i=0;i<AUDIO.stepFrames*2+1;i++){
 tick(walking,[B.right,0]);for(const name of walking.audioEvents)if(name.startsWith('step'))steps.add(name);
}
assert.deepEqual([...steps].sort(),['step1','step2']);

const lost=createRun([quietLevel]);lost.lives=1;lost.players[0].dead=true;tick(lost,[0,0]);
assert(lost.audioEvents.includes('run-lost'));
const won=createRun([{...quietLevel,end:3}]);tick(won,[0,0]);
assert(won.audioEvents.includes('run-win'),'custom-level wins also sound');
const duel=createRun([quietLevel],{mode:'versus'});duel.players[1].dead=true;tick(duel,[0,0]);
assert(duel.audioEvents.includes('round-win'));

const crowded={audioEvents:[]};
for(const name of SOUND_CUES.slice(0,AUDIO.maxCues))emitSound(crowded,name);
emitSound(crowded,'parry');emitSound(crowded,'mask-shatter');emitSound(crowded,'run-win');
assert.equal(crowded.audioEvents.length,AUDIO.maxCues);
for(const name of ['parry','mask-shatter','run-win'])assert(crowded.audioEvents.includes(name));
const count=crowded.audioEvents.length;emitSound(crowded,'parry');assert.equal(crowded.audioEvents.length,count);
assert.equal(new Set(crowded.audioEvents).size,count);
for(const scenario of [state,pogo,damaged,walking,lost,won,duel,crowded])
 for(const name of scenario.audioEvents)assert(SOUND_CUES.includes(name),'declared delivery cue: '+name);
assert.equal(SOUND_CUES.length,new Set(SOUND_CUES).size);
console.log('PASS sound events: mask warnings, attack misses, quick hands, pogo, cracks, steps, results and bounded priority');
