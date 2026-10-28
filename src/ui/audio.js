import {manifest} from './assets.js';
import {localAsset} from '../render/models.js';
import {AUDIO} from '../data/audio.js';
export class AudioBus{
 constructor(settings){this.settings=settings;this.context=null;this.music=new Map();this.buffers=new Map();this.track=null;this.pending=new Set();this.unlocked=false;this.previousCue=null;}
 unlock(){if(this.unlocked)return;this.unlocked=true;try{this.context=new(window.AudioContext||window.webkitAudioContext)();this.context.resume().catch(()=>{});}catch{} }
 path(entry){if(typeof entry==='string')return entry;const a=document.createElement('audio');return a.canPlayType('audio/ogg')?entry?.ogg||entry?.m4a:entry?.m4a||entry?.ogg;}
 async cue(name){if(!this.context||!name||!this.settings.sound)return;const entry=manifest.sounds?.[name];if(entry){try{if(!this.buffers.has(name)&&!this.pending.has(name)){this.pending.add(name);const r=await fetch(localAsset(this.path(entry)));if(r.ok)this.buffers.set(name,await this.context.decodeAudioData(await r.arrayBuffer()));this.pending.delete(name);}const data=this.buffers.get(name);if(!data)return;const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=data;gain.gain.value=this.settings.sound;source.connect(gain).connect(this.context.destination);source.start();}catch{this.pending.delete(name);}return;}
 // Original short oscillator feedback until licensed recordings are delivered.
 const o=this.context.createOscillator(),g=this.context.createGain(),now=this.context.currentTime;o.type='triangle';o.frequency.setValueAtTime(AUDIO.tones[name]||AUDIO.base,now);o.frequency.exponentialRampToValueAtTime((AUDIO.tones[name]||AUDIO.base)*.65,now+AUDIO.duration);g.gain.setValueAtTime(this.settings.sound*AUDIO.volume,now);g.gain.exponentialRampToValueAtTime(.001,now+AUDIO.duration);o.connect(g).connect(this.context.destination);o.start();o.stop(now+AUDIO.duration);
 }
 update(s,title,delta){if(!this.unlocked)return;const base=title?'title':s.bossStarted?'boss':s.area<2?'forest':'hollow';const key=!title&&s.players.some(p=>p.glass&&!p.dead)?`glass-${base}`:base;const entry=manifest.music?.[key];if(this.track!==key){this.track=key;if(entry&&!this.music.has(key))try{const a=new Audio(localAsset(this.path(entry)));a.loop=true;a.volume=0;this.music.set(key,a);const previous=[...this.music.entries()].find(([k,v])=>k!==key&&!v.paused);a.addEventListener('loadedmetadata',()=>{if(previous&&Number.isFinite(a.duration))a.currentTime=previous[1].currentTime%a.duration;});a.play().catch(()=>{});}catch{}}
 for(const [id,a] of this.music){const goal=id===key?this.settings.music:0;a.volume=Math.max(0,Math.min(1,a.volume+(goal-a.volume)*Math.min(1,delta/AUDIO.fade)));if(id===key&&a.paused)a.play().catch(()=>{});if(id!==key&&a.volume<.001)a.pause();}
 }
}
