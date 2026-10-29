import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validSave,loadSave,save} from '../src/core/save.js';
import {validateReplay,record} from '../src/core/replay.js';
import {validateLevel} from '../src/game/level.js';
import {createRun,tick} from '../src/game/run.js';
import {testLevel} from '../src/data/test-level.js';

const replay=record(createRun([testLevel]));
const copy=()=>structuredClone(replay);
for(const [key,value] of [
 ['kind','constructor'],['difficulty','toString'],['mode','network'],
 ['eye','#123456'],['seed','x'.repeat(101)],['rulesVersion',4],['customLevel',null]
]){
 const invalid=copy();invalid.config[key]=value;
 assert.throws(()=>validateReplay(invalid),key+' must fail before restore');
 assert.throws(()=>validSave({version:1,current:invalid}),key+' must fail before import');
}
for(const change of [
 config=>{config.mode='coop';config.kind2='toString';},
 config=>{config.mode='versus';config.arena='missing';}
]){const invalid=copy();change(invalid.config);assert.throws(()=>validateReplay(invalid));}
for(const rulesVersion of [undefined,1,2,3]){
 const old=copy();old.config.rulesVersion=rulesVersion;
 assert.equal(validateReplay(old),old,'historical supported rules remain accepted');
}
for(const inputs of [[[360000,0,0],[1,0,0]],[[1,1024,0]],[[0,0,0]],[[1,-1,0]],[[1,0.5,0]]]){
 assert.throws(()=>validateReplay({...copy(),inputs}));
}
assert.equal(validateReplay({...copy(),inputs:[[360000,0,0]]}).inputs.length,1);

const malformedLevels=[
 level=>level.checkpoints=[],
 level=>level.checkpoints=['twenty'],
 level=>level.checkpoints=[NaN],
 level=>level.start.x=-1,
 level=>level.end=level.width+1,
 level=>level.grid[0][0]=6,
 level=>level.waves[0].enemies[0].y=Infinity,
 level=>level.waves[0].enemies=[],
 level=>level.pieces=[{piece:'fern',x:1,y:1,z:'behind'}],
 level=>level.pieces=[{piece:'fern',x:1,y:1,scale:-1}],
 level=>level.secrets=[{type:'fragment',x:1,y:null}],
 level=>level.hazard='wind',
 level=>level.boss='false'
];
for(const change of malformedLevels){
 const level=structuredClone(testLevel);change(level);
 assert.throws(()=>validateLevel(level));
 const invalid=copy();invalid.config.customLevel=level;
 assert.throws(()=>validSave({version:1,current:invalid}));
}

// Editor levels can be called arena-* and still be tested as a one-level solo run.
const custom=structuredClone(testLevel);custom.id='arena-custom';
const initial=createRun([testLevel],{customLevel:custom});
assert.equal(initial.level.id,'arena-custom');assert.equal(initial.levels.length,1);
for(let i=0;i<120;i++)tick(initial,[0,0]);
const imported=validSave({version:1,current:record(initial)});
const resumed=createRun([testLevel],imported.current.config);
for(const [count,a,b] of imported.current.inputs)for(let i=0;i<count;i++)tick(resumed,[a,b]);
assert.deepEqual(resumed.players,initial.players);
assert.deepEqual(resumed.log,initial.log);

const best={won:true,score:100,time:10,kind:'brawler'};
const clean=validSave({version:1,settings:{touch:'invalid',difficulty:'constructor'},bests:{
 'solo-brawler-normal':best,'solo-skimmer-normal':{...best,score:'100'},
 'solo-spark-normal':{...best,time:null},'unknown-record':best
}});
assert.deepEqual(clean.bests,{'solo-brawler-normal':best});
assert.equal(clean.settings.touch,'auto');assert.equal(clean.settings.difficulty,'normal');
const primitive=validSave({version:1,bests:'invalid records'});
primitive.bests['solo-brawler-normal']=best;
assert.deepEqual(primitive.bests['solo-brawler-normal'],best);
assert.throws(()=>validSave({version:1,current:false}));

for(const name of ['normal-brawler','normal-skimmer','normal-spark','coop-brawler-spark']){
 const checked=JSON.parse(readFileSync(new URL(`./replays/${name}.json`,import.meta.url),'utf8'));
 assert.equal(validateReplay(checked),checked);
}

const previous=globalThis.localStorage;
globalThis.localStorage={getItem(){throw new Error('unavailable');},setItem(){throw new Error('full');}};
try{
 assert.equal(loadSave().current,null);
 assert.equal(save(clean),false,'storage failure remains nonfatal');
}finally{globalThis.localStorage=previous;}
console.log('PASS imports: configuration, bounded levels, custom arena replay, invalid records and unavailable storage');
