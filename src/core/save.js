import {DEFAULT_KEYS} from './input.js';
import {validateReplay} from './replay.js';
import {KINDS} from '../data/kinds.js';
import {EYES,DIFFICULTY} from '../data/feel.js';
export const defaultSettings={language:'en',music:.45,sound:.6,difficulty:'normal',maps:DEFAULT_KEYS,touch:'auto'};
export function validConfig(config){if(!config||!KINDS[config.kind]||!DIFFICULTY[config.difficulty]||!['solo','coop','versus'].includes(config.mode)||typeof config.seed!=='string'||config.seed.length>100||!EYES.includes(config.eye))throw new Error('Invalid configuration');return config;}
export function validSave(data){if(!data||data.version!==1)throw new Error('Invalid save');if(data.current){validateReplay(data.current);validConfig(data.current.config);}const settings={...defaultSettings,...data.settings};if(!['en','fr'].includes(settings.language))settings.language='en';for(const key of ['music','sound'])settings[key]=Math.max(0,Math.min(1,Number(settings[key])||0));if(!DIFFICULTY[settings.difficulty])settings.difficulty='normal';const maps=structuredClone(DEFAULT_KEYS);for(const layout of Object.keys(maps))for(const action of Object.keys(maps[layout])){const codes=settings.maps?.[layout]?.[action];if(Array.isArray(codes)&&codes.length&&codes.length<=5&&codes.every(c=>typeof c==='string'&&/^[A-Za-z0-9]{1,24}$/.test(c)))maps[layout][action]=codes;}settings.maps=maps;return {version:1,settings,current:data.current||null,bests:data.bests||{},unlocked:['brawler']};}
export function loadSave(){try{const raw=localStorage.getItem('glasswing.v1');if(raw)return validSave(JSON.parse(raw));}catch{}return validSave({version:1,settings:structuredClone(defaultSettings)});}
export function save(data){try{localStorage.setItem('glasswing.v1',JSON.stringify(data));return true;}catch{return false;}}
