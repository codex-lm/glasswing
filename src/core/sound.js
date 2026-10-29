import {AUDIO} from '../data/audio.js?v=0.3.1';

export function emitSound(state,name){
 state.audio=name; // Last cue remains available to simple diagnostic consumers.
 const events=state.audioEvents||(state.audioEvents=[]);
 if(events.includes(name))return;
 if(events.length<AUDIO.maxCues){events.push(name);return;}
 // Preserve mask/parry/result warnings when many actors make sounds together.
 let quietest=0;
 for(let i=1;i<events.length;i++)if(priority(events[i])<priority(events[quietest]))quietest=i;
 if(priority(name)>priority(events[quietest]))events[quietest]=name;
}
function priority(name){return AUDIO.priority[name]??4;}
