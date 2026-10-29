export const LEVEL_IDS=['landing','canopy','hollow','nest'];

async function loadLevel(path){
 const response=await fetch(new URL(path,import.meta.url));
 if(!response.ok)throw new Error('Local level unavailable');
 return validateLevel(await response.json());
}
export function loadLevels(){
 return Promise.all(LEVEL_IDS.map(id=>loadLevel(`../data/levels/${id}.json`)));
}
export function loadArenas(){
 return Promise.all(['clearing','canopy','hollow'].map(id=>loadLevel(`../data/levels/arenas/${id}.json`)));
}

const inRange=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
const optionalBoolean=(object,key)=>object[key]===undefined||typeof object[key]==='boolean';

export function validateLevel(level){
 if(!level||typeof level.id!=='string'||!level.id.length||level.id.length>80||
  !Number.isInteger(level.width)||level.width<10||level.width>160||
  !Array.isArray(level.grid)||level.grid.length<2||level.grid.length>30)
  throw new Error('Invalid level');
 const width=level.width,height=level.grid.length;
 if(level.grid.some(row=>!Array.isArray(row)||row.length!==width||
  row.some(tile=>!Number.isInteger(tile)||tile<0||tile>5)))
  throw new Error('Invalid collision grid');
 if(!inRange(level.start?.x,0,width)||!inRange(level.start?.y,0,height)||
  !inRange(level.end,0,width)||!Array.isArray(level.checkpoints)||
  !level.checkpoints.length||level.checkpoints.length>width||
  level.checkpoints.some(x=>!inRange(x,0,width)))
  throw new Error('Invalid level markers');
 if(!optionalBoolean(level,'boss')||
  level.hazard!==undefined&&!['pit','wind','mushrooms'].includes(level.hazard)||
  level.wind!==undefined&&!Number.isFinite(level.wind)||
  level.hazard==='wind'&&!Number.isFinite(level.wind))
  throw new Error('Invalid arena hazard');
 for(const key of ['waves','pieces','secrets']){
  if(level[key]!==undefined&&(!Array.isArray(level[key])||level[key].length>300))
   throw new Error('Invalid level list');
 }
 for(const wave of level.waves||[]){
  if(!wave||!inRange(wave.trigger,0,width)||!Array.isArray(wave.enemies)||
   !wave.enemies.length||wave.enemies.length>4)throw new Error('Invalid wave');
  for(const enemy of wave.enemies){
   if(!enemy||!['brawler','skimmer','spark'].includes(enemy.kind)||
    !inRange(enemy.x,0,width)||!inRange(enemy.y,0,height)||!optionalBoolean(enemy,'elite'))
    throw new Error('Invalid enemy');
  }
 }
 for(const piece of level.pieces||[]){
  if(!piece||typeof piece.piece!=='string'||!piece.piece.length||piece.piece.length>80||
   !Number.isFinite(piece.x)||!Number.isFinite(piece.y)||
   piece.z!==undefined&&!Number.isFinite(piece.z)||
   piece.scale!==undefined&&(!Number.isFinite(piece.scale)||piece.scale<=0)||
   !optionalBoolean(piece,'flip'))throw new Error('Invalid piece');
 }
 for(const secret of level.secrets||[]){
  if(!secret||!['fragment','mask'].includes(secret.type)||
   !inRange(secret.x,0,width)||!inRange(secret.y,0,height))throw new Error('Invalid secret');
 }
 return level;
}
