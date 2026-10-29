import {KINDS} from '../data/kinds.js';
import {EYES,DIFFICULTY} from '../data/feel.js';
import {validateLevel} from '../game/level.js';

export const MODES=['solo','coop','versus'];
export const ARENAS=['arena-clearing','arena-canopy','arena-hollow'];

// Imported replays must be playable before replacing the current local save.
export function validConfig(config){
 if(!config||typeof config!=='object'||Array.isArray(config)||
  !Object.hasOwn(KINDS,config.kind)||!Object.hasOwn(DIFFICULTY,config.difficulty)||
  !MODES.includes(config.mode)||typeof config.seed!=='string'||config.seed.length>100||
  !EYES.includes(config.eye))throw new Error('Invalid configuration');
 if(config.mode!=='solo'&&(!Object.hasOwn(KINDS,config.kind2)||!EYES.includes(config.eye2)))
  throw new Error('Invalid second player');
 if(config.rulesVersion!==undefined&&![1,2,3].includes(config.rulesVersion))
  throw new Error('Unsupported rules version');
 if(config.mode==='versus'&&config.arena!==undefined&&!ARENAS.includes(config.arena))
  throw new Error('Invalid arena');
 if(config.customLevel!==undefined)validateLevel(config.customLevel);
 return config;
}
