import {DEFAULT_KEYS} from './input.js';
import {record,validateReplay} from './replay.js';
import {KINDS} from '../data/kinds.js';
import {DIFFICULTY} from '../data/feel.js';
import {MODES} from './config.js';
export {validConfig} from './config.js';

export const defaultSettings={language:'en',music:.45,sound:.6,difficulty:'normal',maps:DEFAULT_KEYS,touch:'auto'};

function validSettings(value){
 const settings={...defaultSettings};
 for(const key of Object.keys(settings))if(value?.[key]!==undefined)settings[key]=value[key];
 if(!['en','fr'].includes(settings.language))settings.language='en';
 for(const key of ['music','sound'])settings[key]=Math.max(0,Math.min(1,Number(settings[key])||0));
 if(!Object.hasOwn(DIFFICULTY,settings.difficulty))settings.difficulty='normal';
 if(!['auto','on','off'].includes(settings.touch))settings.touch='auto';
 const maps=structuredClone(DEFAULT_KEYS);
 for(const layout of Object.keys(maps))for(const action of Object.keys(maps[layout])){
  const codes=settings.maps?.[layout]?.[action];
  if(Array.isArray(codes)&&codes.length&&codes.length<=5&&
   codes.every(code=>typeof code==='string'&&/^[A-Za-z0-9]{1,24}$/.test(code)))
   maps[layout][action]=[...codes];
 }
 settings.maps=maps;
 return settings;
}

function validBests(value){
 const bests={};
 // Invalid optional records are discarded; they must not crash a later result screen.
 for(const mode of MODES)for(const kind of Object.keys(KINDS))for(const difficulty of Object.keys(DIFFICULTY)){
  const key=mode+'-'+kind+'-'+difficulty,entry=value?.[key];
  if(entry&&typeof entry.won==='boolean'&&Number.isFinite(entry.score)&&entry.score>=0&&
   Number.isFinite(entry.time)&&entry.time>=0)bests[key]={...entry};
 }
 return bests;
}

export function validSave(data){
 if(!data||data.version!==1)throw new Error('Invalid save');
 if(data.current!==undefined&&data.current!==null)validateReplay(data.current);
 return {
  version:1,settings:validSettings(data.settings),current:data.current||null,
  bests:validBests(data.bests),unlocked:['brawler','skimmer','spark']
 };
}
export function loadSave(){
 try{
  const raw=localStorage.getItem('glasswing.v1');
  if(raw)return validSave(JSON.parse(raw));
 }catch{}
 return validSave({version:1});
}
export function save(data){
 try{localStorage.setItem('glasswing.v1',JSON.stringify(data));return true;}
 catch{return false;}
}
export function captureCurrent(storage,state,active,replaying){
 // The animated title and watched recordings must never overwrite the player's run.
 if(active&&!replaying&&!state.players[0].showcase&&state.phase!=='result')storage.current=record(state);
}
