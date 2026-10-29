import {manifest} from './assets.js';
import {localAsset} from '../render/models.js';
import {AUDIO} from '../data/audio.js';

const family=key=>key?.replace(/^glass-/,'');
export class AudioBus {
 constructor(settings) {
  this.settings=settings;this.context=null;this.unlocked=false;this.track=null;
  this.music=new Map();this.buffers=new Map();this.pending=new Map();
  this.failedSounds=new Set();this.failedMusic=new Set();
  this.starting=new Set();this.blocked=new Set();this.syncFrom=new Map();
  this.loops=new Map();this.wantedLoops=new Set();this.effects=new Set();
 }
 unlock() {
  this.unlocked=true;
  if(!this.context)try{this.context=new(window.AudioContext||window.webkitAudioContext)();}catch{}
  this.context?.resume().catch(()=>{});
  // A fresh gesture may recover suspended audio; failed autoplay is never retried every frame.
  this.blocked.clear();
 }
 path(entry) {
  if(typeof entry==='string')return entry;
  const a=document.createElement('audio');
  return a.canPlayType('audio/ogg')?entry?.ogg||entry?.m4a:entry?.m4a||entry?.ogg;
 }
 loadSound(name) {
  if(this.buffers.has(name))return Promise.resolve(this.buffers.get(name));
  if(this.pending.has(name))return this.pending.get(name);
  if(!this.context||!manifest.sounds?.[name]||this.failedSounds.has(name))return Promise.resolve(null);
  const task=Promise.resolve().then(async()=>{
   try {
    const r=await fetch(localAsset(this.path(manifest.sounds[name])));
    if(!r.ok)throw new Error('Missing sound');
    const data=await this.context.decodeAudioData(await r.arrayBuffer());
    this.buffers.set(name,data);return data;
   }catch{this.failedSounds.add(name);return null;}
   finally{this.pending.delete(name);}
  });
  this.pending.set(name,task);return task;
 }
 voice(buffer,loop=false) {
  const source=this.context.createBufferSource(),gain=this.context.createGain();
  source.buffer=buffer;source.loop=loop;gain.gain.value=this.settings.sound*(loop?AUDIO.loopVolume:1);
  const voice={source,gain};
  if(!loop)this.effects.add(voice);
  source.connect(gain).connect(this.context.destination);
  source.onended=()=>{source.disconnect();gain.disconnect();this.effects.delete(voice);};
  source.start();return voice;
 }
 resetEffects() {
  for(const voice of this.effects)try{voice.source.stop();}catch{}
  for(const voice of this.loops.values())try{voice.source.stop();}catch{}
  this.effects.clear();this.loops.clear();this.wantedLoops.clear();
 }
 cue(name) {
  if(!this.context||!name||!this.settings.sound)return;
  const data=this.buffers.get(name);
  if(data){this.voice(data);return;}
  // First-use feedback stays immediate; decoding prepares future hits, never a late one.
  if(manifest.sounds?.[name]&&!this.failedSounds.has(name))this.loadSound(name);
  const o=this.context.createOscillator(),g=this.context.createGain(),now=this.context.currentTime;
  const voice={source:o,gain:g};this.effects.add(voice);
  const tone=AUDIO.tones[name]||AUDIO.base;o.type='triangle';
  o.frequency.setValueAtTime(tone,now);o.frequency.exponentialRampToValueAtTime(tone*.65,now+AUDIO.duration);
  g.gain.setValueAtTime(this.settings.sound*AUDIO.volume,now);g.gain.exponentialRampToValueAtTime(.001,now+AUDIO.duration);
  o.connect(g).connect(this.context.destination);
  o.onended=()=>{o.disconnect();g.disconnect();this.effects.delete(voice);};o.start();o.stop(now+AUDIO.duration);
 }
 ensureMusic(key,entry) {
  if(!entry||this.music.has(key)||this.failedMusic.has(key))return;
  try {
   const a=new Audio(localAsset(this.path(entry)));a.loop=true;a.volume=0;
   this.music.set(key,a);
   a.addEventListener('loadedmetadata',()=>this.alignMusic(key));
   a.addEventListener('error',()=>this.failedMusic.add(key));
  }catch{this.failedMusic.add(key);}
 }
 alignMusic(key) {
  const a=this.music.get(key),source=this.syncFrom.get(key);
  if(key!==this.track||!a||!source||!Number.isFinite(a.duration)||a.duration<=0)return;
  try{a.currentTime=source.currentTime%a.duration;this.syncFrom.delete(key);}catch{}
 }
 playMusic(key,a) {
  if(!a.paused||this.starting.has(key)||this.blocked.has(key)||this.failedMusic.has(key))return;
  this.starting.add(key);
  Promise.resolve(a.play()).catch(()=>this.blocked.add(key)).finally(()=>this.starting.delete(key));
 }
 updateLoops(s,active) {
  this.wantedLoops.clear();
  if(active&&this.settings.sound)for(const p of s.players)if(!p.dead) {
   if(p.clip==='glide')this.wantedLoops.add('glide-loop');
   if(p.charge>0)this.wantedLoops.add('blast-charge-loop');
   if(p.glass)this.wantedLoops.add('glass-loop');
  }
  for(const [name,voice] of this.loops) {
   if(!this.wantedLoops.has(name)){voice.source.stop();this.loops.delete(name);}
   else voice.gain.gain.value=this.settings.sound*AUDIO.loopVolume;
  }
  for(const name of this.wantedLoops) {
   if(this.loops.has(name)||!manifest.sounds?.[name]||this.failedSounds.has(name))continue;
   const buffer=this.buffers.get(name);
   if(buffer)this.loops.set(name,this.voice(buffer,true));
   else if(!this.pending.has(name))this.loadSound(name);
  }
 }
 update(s,title,delta,paused=false) {
  if(!this.unlocked)return;
  const base=title?'title':s.bossStarted?'boss':s.area<2?'forest':'hollow';
  const wanted=!title&&s.players.some(p=>p.glass&&!p.dead)?'glass-'+base:base;
  // A partial delivery keeps the normal loop instead of fading to silence.
  const key=manifest.music?.[wanted]?wanted:base;
  this.ensureMusic(key,manifest.music?.[key]);
  if(this.track!==key) {
   const previous=this.music.get(this.track);
   if(previous&&Number.isFinite(previous.duration)&&previous.duration>0&&family(this.track)===family(key))this.syncFrom.set(key,previous);
   else this.syncFrom.delete(key);
   this.track=key;this.alignMusic(key);
  }
  for(const [id,a] of this.music) {
   const goal=id===key?this.settings.music:0;
   a.volume=Math.max(0,Math.min(1,a.volume+(goal-a.volume)*Math.min(1,delta/AUDIO.fade)));
   if(id===key){this.alignMusic(id);this.playMusic(id,a);}
   else if(a.volume<AUDIO.silence)a.pause();
  }
  this.updateLoops(s,!title&&!paused&&s.phase==='playing');
 }
}
