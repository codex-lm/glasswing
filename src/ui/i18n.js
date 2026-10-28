import en from '../i18n/en.js';
import fr from '../i18n/fr.js';
export let language='en';
export function setLanguage(value){language=value==='fr'?'fr':'en';if(typeof document!=='undefined')document.documentElement.lang=language;}
export function t(key,params={}){let value=(language==='fr'?fr:en)[key];if(value===undefined)throw new Error(`Missing translation: ${key}`);for(const [k,v] of Object.entries(params))value=value.replaceAll(`{${k}}`,v);return value;}
