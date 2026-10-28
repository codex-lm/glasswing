// A legal input-only bot. It reads simulation state like an observation, never changes it.
// Re-run after tuning and keep the exact input recording, not a scripted state snapshot.
import {readFileSync,writeFileSync} from 'node:fs';
import {createRun,tick} from '../src/game/run.js';
import {B} from '../src/core/input.js';
import {record} from '../src/core/replay.js';
const levels=['landing','canopy','hollow','nest'].map(id=>JSON.parse(readFileSync(`src/data/levels/${id}.json`)));
export function bot(s,index=0){const p=s.players[index];if(s.phase==='altar'||s.phase==='bonus')return s.frame%2?B.attack:0;if(s.phase!=='playing'||p.dead)return 0;const enemies=s.enemies.filter(e=>!e.dead);const target=enemies.sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];let mask=0;
 if(target){const dx=target.x-p.x,dist=Math.abs(dx);if(dist>1.5)mask|=dx>0?B.right:B.left;else if(p.facing!==Math.sign(dx))mask|=dx>0?B.right:B.left;
  if(s.frame%22===0)mask|=B.sword;
  if(target.y>p.y+.45&&s.frame%30<15)mask|=B.jump;
  if(target.ai==='telegraph'&&target.aiTimer<6&&dist<2.3&&p.grounded){mask|=B.block;mask&=~(B.left|B.right);}
  if(target.boss){if(s.frame%40<20)mask|=B.jump;if(target.ai==='attack'&&dist<3&&p.dodgeCd===0)mask|=B.dodge;}
  if(dist>3&&s.frame%40<2)mask|=B.blast;
 }else{mask=B.right;if(s.frame%22===0)mask|=B.sword;}
 const ahead=Math.floor(p.x+(mask&B.left?-.8:.8));if((!s.level.grid[0][ahead]||s.level.grid[1]?.[ahead]===4)&&p.grounded)mask|=B.jump;
 if(!p.grounded&&p.vy<0&&!s.level.grid[0][Math.floor(p.x)]&&s.frame%12<6)mask|=B.jump;
 return mask;
}
const state=createRun(levels,{seed:'charles-first-flight',kind:'brawler',difficulty:'normal'});
for(let i=0;i<108000&&state.phase!=='result';i++)tick(state,[bot(state),0]);
console.log(JSON.stringify({phase:state.phase,won:state.won,area:state.area,lives:state.lives,frames:state.frame,seconds:state.frame/60,kills:state.players[0].kills,x:state.players[0].x,mask:state.players[0].mask,enemies:state.enemies.filter(e=>!e.dead).map(e=>({kind:e.kind,x:e.x,y:e.y,hp:e.hp,boss:e.boss}))},null,2));
if(state.won){writeFileSync('tests/replays/normal-brawler.json',JSON.stringify(record(state))+'\n');}else process.exitCode=1;
