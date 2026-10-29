// Refactor audit: hash every simulation frame, including RNG, collisions and FX.
// Run before/after a behaviour-preserving change and compare the JSON output.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createRun,tick} from '../src/game/run.js';
import {B} from '../src/core/input.js';

const load=id=>JSON.parse(readFileSync(`src/data/levels/${id}.json`));
const levels=['landing','canopy','hollow','nest'].map(load);
function trace(state,advance){
 const hash=createHash('sha256');
 const sample=()=>{
  // Static definitions and the growing input log are already fixed by the input.
  const {levels,config,log,...dynamic}=state;
  hash.update(JSON.stringify(dynamic));
 };
 sample();advance(sample);
 return {frames:state.frame,won:state.won,lives:state.lives,sha256:hash.digest('hex')};
}
for(const name of ['normal-brawler','normal-skimmer','normal-spark','coop-brawler-spark']){
 const replay=JSON.parse(readFileSync(`tests/replays/${name}.json`));
 const state=createRun(levels,replay.config);
 console.log(JSON.stringify({name,...trace(state,sample=>{
  for(const [count,a,b] of replay.inputs)for(let i=0;i<count;i++){tick(state,[a,b]);sample();}
 })}));
}
for(const arena of ['clearing','canopy','hollow']){
 const level=load(`arenas/${arena}`);
 const state=createRun([level],{mode:'versus',arena:level.id,kind:'spark',kind2:'skimmer',seed:'trace-duel'});
 console.log(JSON.stringify({name:level.id,...trace(state,sample=>{
  for(let i=0;i<3600&&state.phase!=='result';i++){
   const actions=(i%31===0?B.sword:0)|(i%97<29?B.jump:0)|(i%71<12?B.block:0)|(i%83<20?B.blast:0);
   tick(state,[(i%120<60?B.right:B.left)|actions,(i%120<60?B.left:B.right)|actions]);sample();
  }
 })}));
}
