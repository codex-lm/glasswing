import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateLevel} from '../src/game/level.js';
import {BOSS} from '../src/data/boss.js';
export const levels=['landing','canopy','hollow','nest'].map(id=>JSON.parse(readFileSync(`src/data/levels/${id}.json`)));
for(const level of levels){validateLevel(level);assert.equal(level.width,60);assert.deepEqual(level.checkpoints,[2,20,40]);assert.equal(level.secrets.filter(s=>s.type==='fragment').length,1);assert.equal(level.secrets.filter(s=>s.type==='mask').length,1);for(const c of level.checkpoints)assert(level.grid[0][c]===1,'checkpoint has safe ground');for(const wave of level.waves){assert(wave.enemies.length>=2&&wave.enemies.length<=4);for(const e of wave.enemies)if(e.kind!=='skimmer')assert(level.grid[0][Math.floor(e.x)]===1,'ground enemy has safe spawn support');}
 // Flood fill support surfaces with conservative double-jump reach (4.5 tiles, 5 vertical).
 const nodes=[];for(let y=0;y<level.grid.length;y++)for(let x=0;x<level.width;x++)if([1,2,3].includes(level.grid[y][x])&&!level.grid[y+1]?.[x])nodes.push({x:x+.5,y:y+1});const visited=new Set();const queue=nodes.filter(n=>Math.abs(n.x-level.start.x)<1&&n.y===1);while(queue.length){const n=queue.shift(),key=`${n.x}:${n.y}`;if(visited.has(key))continue;visited.add(key);for(const m of nodes)if(!visited.has(`${m.x}:${m.y}`)&&Math.abs(m.x-n.x)<=4.5&&m.y-n.y<=5&&m.y-n.y>=-6)queue.push(m);}assert(nodes.some(n=>n.x>=level.end-1&&visited.has(`${n.x}:${n.y}`)),'exit reachable');
}
assert(BOSS.telegraph>=20&&BOSS.telegraph<=30);console.log('PASS four levels: schemas, checkpoints, secrets, wave groups and jump-graph reachability; boss telegraph');
