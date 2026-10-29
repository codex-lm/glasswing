import assert from 'node:assert/strict';
import {AudioBus} from '../src/ui/audio.js';
import {manifest} from '../src/ui/assets.js';

// Exercise phase/lifecycle decisions without pretending these mocks prove audible quality.
class Media {
 constructor(url){this.url=url;this.duration=60;this.currentTime=0;this.paused=true;this.volume=0;this.events={};this.plays=0;}
 addEventListener(name,fn){this.events[name]=fn;}
 play(){this.plays++;if(this.reject)return Promise.reject(new Error('Gesture required'));this.paused=false;return Promise.resolve();}
 pause(){this.paused=true;}
}
const previousAudio=globalThis.Audio,previousFetch=globalThis.fetch;
const oldMusic=manifest.music,oldSounds=manifest.sounds;
let requests=0,stops=0;
const node=()=>({connect(){return this;},disconnect(){},start(){},stop(){stops++;this.onended?.();},gain:{value:0}});
try {
 globalThis.Audio=Media;
 globalThis.fetch=async()=>{requests++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)};};
 manifest.music={forest:'assets/audio/music/forest.ogg','glass-forest':'assets/audio/music/glass-forest.ogg'};
 manifest.sounds={'glide-loop':'assets/audio/sfx/glide-loop.ogg'};
 const bus=new AudioBus({music:.4,sound:.6});bus.unlocked=true;
 bus.context={createBufferSource:node,createGain:node,destination:{},decodeAudioData:async()=>({duration:1}),resume:async()=>{}};
 const state={area:0,bossStarted:false,phase:'playing',players:[{glass:false,dead:false,clip:'idle',charge:0}]};
 bus.update(state,false,1/60);const normal=bus.music.get('forest');normal.currentTime=17.25;
 state.players[0].glass=true;bus.update(state,false,1/60);
 const glass=bus.music.get('glass-forest');assert.equal(glass.currentTime,17.25);
 for(let i=0;i<400;i++)bus.update(state,false,1/60);
 assert(normal.paused,'old track pauses after fading out');
 glass.currentTime=45.6;state.players[0].glass=false;bus.update(state,false,1/60);
 assert.equal(normal.currentTime,45.6,'return to a reused normal loop preserves musical phase');
 normal.currentTime=55;state.players[0].glass=true;bus.update(state,false,1/60);
 assert.equal(glass.currentTime,55,'a second break also realigns the existing glass loop');

 glass.duration=NaN;glass.currentTime=0;normal.currentTime=19;
 state.players[0].glass=false;bus.update(state,false,1/60);
 assert.equal(normal.currentTime,19,'an unloaded variant cannot reset the running normal loop');
 normal.currentTime=21;state.players[0].glass=true;bus.update(state,false,1/60);
 normal.currentTime=22;glass.duration=60;glass.events.loadedmetadata();
 assert.equal(glass.currentTime,22,'late metadata reads the current source phase');

 delete manifest.music['glass-forest'];bus.update(state,false,1/60);
 assert.equal(bus.track,'forest','partial deliveries retain normal music');

 state.players[0].clip='glide';state.players[0].glass=false;
 bus.update(state,false,1/60);await bus.pending.get('glide-loop');bus.update(state,false,1/60);
 assert(bus.loops.has('glide-loop'));bus.update(state,false,1/60);
 assert.equal(requests,1,'one decode request, not one per frame');
 bus.update(state,false,1/60,true);assert.equal(bus.loops.size,0);assert.equal(stops,1,'pause ends sustained effects');

 normal.pause();normal.reject=true;await Promise.resolve();await Promise.resolve();
 bus.update(state,false,1/60);await Promise.resolve();await Promise.resolve();
 const attempts=normal.plays;for(let i=0;i<30;i++)bus.update(state,false,1/60);
 assert.equal(normal.plays,attempts,'autoplay rejection is not retried every render');
 normal.reject=false;bus.unlock();bus.update(state,false,1/60);
 assert(!normal.paused,'new user gesture can recover playback');

 manifest.sounds.bad='https://example.invalid/sound.ogg';
 assert.equal(await bus.loadSound('bad'),null);assert(!bus.pending.has('bad'));
 assert.equal(requests,1,'rejected asset paths never reach fetch');

 manifest.sounds['blast-charge-loop']='assets/audio/sfx/blast-charge-loop.ogg';
 manifest.sounds['glass-loop']='assets/audio/sfx/glass-loop.ogg';
 state.players[0].charge=1;state.players[0].glass=true;
 bus.update(state,false,1/60);await Promise.all([...bus.pending.values()]);bus.update(state,false,1/60);
 assert.deepEqual([...bus.loops.keys()].sort(),['blast-charge-loop','glass-loop','glide-loop']);
 state.players[0].clip='idle';state.players[0].charge=0;state.players[0].glass=false;
 bus.update(state,false,1/60);assert.equal(bus.loops.size,0);

 let complete,disconnected=0;
 const starts={tone:0,sample:0},sources=[];
 const source=type=>{
  const value={connect(){return this;},disconnect(){disconnected++;},
   start(){starts[type]++;},stop(when){if(when===undefined)this.onended?.();},
   frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}}};
  sources.push(value);return value;
 };
 const gain=()=>({connect(){return this;},disconnect(){disconnected++;},
  gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}}});
 globalThis.fetch=()=>new Promise(resolve=>complete=resolve);
 manifest.sounds.delayed='assets/audio/sfx/delayed.ogg';
 const effects=new AudioBus({sound:.5,music:0});
 effects.context={currentTime:10,destination:{},decodeAudioData:async()=>({duration:1}),
  createBufferSource:()=>source('sample'),createOscillator:()=>source('tone'),createGain:gain};
 effects.cue('delayed');
 assert.equal(starts.tone,1,'first-use feedback never waits for audio decoding');
 assert.equal(starts.sample,0);assert.equal(effects.effects.size,1);
 await Promise.resolve();
 const pending=effects.pending.get('delayed');
 effects.resetEffects();assert.equal(effects.effects.size,0);assert.equal(disconnected,2);
 complete({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});await pending;
 assert.equal(starts.sample,0,'completion after a pause cannot play a stale event');
 effects.cue('delayed');assert.equal(starts.sample,1,'the next event uses the decoded recording');
 sources.at(-1).onended();assert.equal(effects.effects.size,0);assert.equal(disconnected,4);
 effects.settings.sound=0;effects.cue('delayed');assert.equal(starts.sample,1);
 effects.settings.sound=.5;
 const loop=effects.voice({duration:1},true);effects.loops.set('test-loop',loop);
 effects.cue('delayed');effects.resetEffects();
 assert.equal(effects.loops.size,0);assert.equal(effects.effects.size,0);
 assert.equal(disconnected,8,'all effect and loop nodes disconnect at a screen boundary');

 console.log('PASS audio: bidirectional loop phase, immediate first-use feedback, delayed decode isolation, node cleanup and bounded autoplay retry');
} finally {
 globalThis.Audio=previousAudio;globalThis.fetch=previousFetch;
 manifest.music=oldMusic;manifest.sounds=oldSounds;
}
