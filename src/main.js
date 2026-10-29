import {t,setLanguage} from './ui/i18n.js';

import {View} from './render/scene.js';

import {Input,B,MENU} from './core/input.js';

import {testLevel} from './data/test-level.js';

import {loadManifest} from './ui/assets.js';

import {Screens} from './ui/screens.js';

import {hud} from './ui/hud.js?v=0.3.1';
import {soloHelp,twoPlayerHelp,tutorialHelp,keyLabel} from './ui/control-help.js';

import {createRun,tick} from './game/run.js';

import {KINDS} from './data/kinds.js';
import {loadLevels,loadArenas,validateLevel} from './game/level.js';

import {record,validateReplay,ReplayCursor} from './core/replay.js';
import {REPLAY_FILES} from './data/resources.js';

import {loadSave,save,captureCurrent} from './core/save.js';

import {options} from './ui/options.js';

import {TouchControls} from './ui/touch.js';
import {AudioBus} from './ui/audio.js?v=0.3.1';

import {resultsHTML,resultStats,betterResult,shareCard,download} from './ui/results.js';

import {EYES,F} from './data/feel.js';

const storage=loadSave();setLanguage(storage.settings.language);

const view=new View(document.querySelector('#world'),{disabled:new URLSearchParams(location.search).has('no-webgl')}),input=new Input(),screens=new Screens(document.querySelector('#ui')),audio=new AudioBus(storage.settings);

const touch=new TouchControls(input,storage.settings,pause);
screens.onChange=()=>input.clear();
screens.onCue=name=>{audio.unlock();audio.cue(name);};
input.maps=structuredClone(storage.settings.maps);

let ready=false,customLevel=null,levels=[testLevel],state=createRun(levels),paused=false,uiPhase='',queued=[0,0],replaying=null,activeRun=false,saveFrame=0;

view.setLevel(state.level);loadManifest(new URLSearchParams(location.search).get('assets')==='test'?'./assets/manifest.test.json':'./assets/manifest.json');Promise.all([loadLevels(),loadArenas()]).then(([forest,arenas])=>{levels=forest.concat(arenas);if(new URLSearchParams(location.search).has('editor')){try{customLevel=validateLevel(JSON.parse(localStorage.getItem('glasswing.editor.v1')));levels=[customLevel];}catch{}}ready=true;if(customLevel)select('solo');}).catch(()=>screens.simple('play',t('loadError'),title));

window.addEventListener('pagehide',persist);
window.addEventListener('keydown',()=>audio.unlock());window.addEventListener('pointerdown',()=>audio.unlock());

function persist(){captureCurrent(storage,state,activeRun,replaying);save(storage);}

function title(){audio.resetEffects();activeRun=false;paused=false;input.clear();queued.fill(0);input.multi=false;replaying=null;state=createRun(levels);state.players[0].showcase=true;state.players[0].x=13;state.players[0].px=13;state.players[0].y=1;state.players[0].py=1;view.setLevel(state.level);document.querySelector('#hud').innerHTML='';document.querySelector('#glass-border').className='';screens.title({play:()=>select('solo'),twoPlayers:twoPlayers,options:()=>showOptions(title),howto:howto},!view.available);

 const row=document.createElement('div');row.className='buttons';if(storage.current){const b=document.createElement('button');b.textContent=t('continue');b.onclick=resumeSaved;row.append(b);}screens.root.firstChild.append(row);}

function showOptions(back){audio.settings=storage.settings;touch.settings=storage.settings;options(screens,storage,input,back,()=>{audio.settings=storage.settings;title();});}

function howto(){screens.show('howto',`<section class="panel"><h2>${t('howto')}</h2><p>${soloHelp(input.maps)}</p><h3>${t('credits')}</h3><p>${t('about')}</p><label>${t('verifiedReplays')}<select id="replay-choice">${['normal-brawler','normal-skimmer','normal-spark','coop-brawler-spark'].map((id,i)=>`<option value="${id}">${t(i===3?'coop':id.slice(7))}</option>`).join('')}</select></label><div class="buttons"><button data-action="back">${t('back')}</button><button data-action="replay">${t('replayWatch')}</button></div></section>`,{back:title,replay:watchReplay});}

function twoPlayers(){screens.show('twoPlayers',`<section class="panel"><div class="eyebrow">${t('localModes')}</div><h2>${t('twoPlayers')}</h2><div class="grid"><button data-action="versus" class="card"><h3>${t('versus')}</h3><p>${t('versusDesc')}</p></button><button data-action="coop" class="card"><h3>${t('coop')}</h3><p>${t('coopDesc')}</p></button></div><p>${twoPlayerHelp(input.maps)}</p><button data-action="back">${t('back')}</button></section>`,{versus:()=>select('versus'),coop:()=>select('coop'),back:title});}
function select(mode='solo'){const count=mode==='solo'?1:2;screens.show('select',`<section class="panel"><div class="eyebrow">${t('choose')}</div><h2>${t(mode)}</h2><div class="grid">${Array.from({length:count},(_,i)=>`<div class="card"><h3>${t(i?'p2':'p1')}</h3><label>${t('kind')}<select id="kind${i}">${Object.entries(KINDS).map(([k,v])=>`<option value="${k}">${t(k)} · ${v.mask} ${t('maskHits')}</option>`).join('')}</select></label><label>${t('eye')}<select id="eye${i}">${EYES.map((c,j)=>`<option value="${c}">${t(['orange','cyan','green','violet','red','yellow','pink','white'][j])}</option>`).join('')}</select></label></div>`).join('')}</div><div class="row">${mode!=='versus'?`<label>${t('difficulty')}<select id="difficulty">${['easy','normal','hard'].map(d=>`<option value="${d}">${t(d)}</option>`).join('')}</select></label>`:`<label>${t('arena')}<select id="arena">${['arena-clearing','arena-canopy','arena-hollow'].map(d=>`<option value="${d}">${t(d)}</option>`).join('')}</select></label>`}<label>${t('seed')}<input id="seed" maxlength="100"></label></div>${count===2?`<p>${twoPlayerHelp(input.maps)}</p><small>${t('sameEyes')}</small>`:''}<div class="buttons"><button class="primary" data-action="start">${t('start')}</button><button data-action="back">${t('back')}</button></div></section>`,{start:()=>{state.config={...state.config,kind:document.querySelector('#kind0').value,rulesVersion:3,mode,eye:document.querySelector('#eye0').value,kind2:document.querySelector('#kind1')?.value||'skimmer',eye2:document.querySelector('#eye1')?.value||EYES[1],arena:document.querySelector('#arena')?.value||'arena-clearing',difficulty:document.querySelector('#difficulty')?.value||'normal',seed:document.querySelector('#seed').value||'glasswing'};storage.settings.difficulty=state.config.difficulty;start();},back:mode==='solo'?title:twoPlayers});if(mode!=='versus')document.querySelector('#difficulty').value=storage.settings.difficulty;document.querySelector('#seed').value='forest-'+new Date().toISOString().slice(0,10);if(count===2){document.querySelector('#eye1').value=EYES[1];document.querySelector('#kind1').value='skimmer';}}
function start(){if(!ready){screens.simple('play',t('loading'),()=>select(state.config.mode));return;}audio.resetEffects();replaying=null;activeRun=true;queued.fill(0);state=createRun(levels,{...state.config,...(customLevel?{customLevel}:{} )});input.multi=state.config.mode!=='solo';paused=false;input.clear();view.setLevel(state.level);uiPhase='';saveFrame=0;screens.clear();syncUI();persist();}

function resumeSaved(){if(!storage.current)return;if(!ready){screens.simple('play',t('loading'),title);return;}try{const r=validateReplay(storage.current);audio.resetEffects();state=createRun(levels,r.config);input.multi=state.config.mode!=='solo';for(const [n,a,b] of r.inputs)for(let i=0;i<n;i++)tick(state,[a,b]);paused=false;replaying=null;activeRun=true;queued.fill(0);saveFrame=state.frame;input.clear();view.setLevel(state.level);uiPhase='';syncUI();}catch{screens.simple('play',t('invalidSave'),title);}}

async function watchReplay(){
 if(!ready){screens.simple('howto',t('loading'),howto);return;}
 const revision=screens.revision;
 try{
  const choice=document.querySelector('#replay-choice')?.value;
  const name=['normal-brawler','normal-skimmer','normal-spark','coop-brawler-spark'].includes(choice)?choice:'normal-brawler';
  const response=await fetch(REPLAY_FILES[name]);
  if(!response.ok)throw new Error('Missing replay');
  const replay=validateReplay(await response.json());
  if(screens.revision!==revision)return;
  audio.resetEffects();replaying=new ReplayCursor(replay);activeRun=false;
  state=createRun(levels,replaying.config);input.multi=state.config.mode!=='solo';input.clear();queued.fill(0);
  paused=false;uiPhase='';view.setLevel(state.level);syncUI();
 }catch{if(screens.revision===revision)screens.simple('howto',t('invalidSave'),howto);}
}

function syncUI(){const key=state.phase+state.altarPlayer;if(uiPhase===key)return;uiPhase=key;input.clear();if(state.phase==='playing'){screens.clear();view.setLevel(state.level);}else if(state.phase==='altar'||state.phase==='bonus'){screens.show('altar',`<section class="panel"><div class="eyebrow">${t('chooseUpgrade')} ${state.players.length>1?' · '+t(state.altarPlayer?'p2':'p1'):''}</div><h2>${t(state.phase==='bonus'?'bonus':'altar')}</h2><div class="grid">${state.choices.map((id,i)=>`<button data-choice="${i}" class="card"><h3>${t(id)}</h3><p>${t(id+'Desc')}</p><span class="key">${keyLabel(input.maps[input.multi?(state.altarPlayer?'p2':'p1'):'solo'][['attack','sword','blast'][i]][0])}</span></button>`).join('')}</div></section>`);for(const b of document.querySelectorAll('[data-choice]'))b.onclick=()=>queued[state.altarPlayer]=[B.attack,B.sword,B.blast][Number(b.dataset.choice)];persist();}else if(state.phase==='round'){screens.show('round',`<div class="hint">${state.roundWinner<0?t('draw'):t('roundWon',{player:state.roundWinner+1})} · ${state.scores.join(' : ')}</div>`);}else if(state.phase==='respawn'){screens.show('respawn',`<div class="hint">${t('respawn')}</div>`);}else if(state.phase==='result'){if(!replaying){storage.current=null;const stats=resultStats(state);const id=state.config.mode+'-'+state.config.kind+'-'+state.config.difficulty;if(betterResult(stats,storage.bests[id]))storage.bests[id]=stats;save(storage);}screens.show('result',resultsHTML(state),{retry:start,card:async()=>{try{await shareCard(state);}catch{const status=document.querySelector('#export-status');if(status)status.textContent=t('exportFailed');}},replay:()=>download(JSON.stringify(record(state)),'glasswing-replay.json'),home:title});}}

function resume(){paused=false;uiPhase='';input.clear();syncUI();}

function pause(){if(paused)return;audio.resetEffects();paused=true;input.clear();persist();screens.show('pause',`<section class="panel"><h2>${t('pause')}</h2><div class="buttons"><button data-action="resume">${t('resume')}</button><button data-action="options">${t('options')}</button><button data-action="home">${t('home')}</button><button data-action="replay">${t('exportReplay')}</button></div></section>`,{resume,options:()=>showOptions(pauseReturn),home:title,replay:()=>download(JSON.stringify(record(state)),'glasswing-replay.json')});}

function pauseReturn(){paused=false;pause();}



document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','altar','respawn','round'].includes(screens.name))pause();});

function menuPad(){
 const menu=input.poll();
 if(input.pausePressed){
  audio.unlock();
  if(paused||!['playing','altar','respawn','round'].includes(screens.name))screens.back();
  else pause();
  return;
 }
 if(!menu||['playing','respawn','round'].includes(screens.name)||replaying&&!paused)return;
 audio.unlock();
 if(menu&MENU.back)screens.back();else screens.navigate(menu);
}

let last=0,acc=0;
function loop(time){
 menuPad();
 touch.visible(screens.name==='playing'&&!paused&&!replaying);
 const dt=Math.min(.1,(time-last)/1000||0);last=time;acc+=dt;
 let steps=0;
 while(acc>=1/F.hz&&steps++<F.maxSteps){
  if(['playing','altar','respawn','round'].includes(screens.name)&&!paused){
   const masks=[input.sample(0)|queued[0],(input.multi?input.sample(1):0)|queued[1]];
   queued.fill(0);
   // Pause is handled once per render above, never recorded as gameplay input.
   masks[0]&=~B.pause;masks[1]&=~B.pause;
   if(replaying&&!replaying.next(masks))pause();
   else{
    const revision=state.levelRevision;
    tick(state,masks);
    if(state.audioEvents?.length)for(const name of state.audioEvents)audio.cue(name);
    else if(state.audio)audio.cue(state.audio);
    if(state.levelRevision!==revision)view.setLevel(state.level);
    syncUI();
    if(state.frame-saveFrame>=900){persist();saveFrame=state.frame;}
   }
   if(state.frame%6===0){
    hud(state);
    if(screens.name==='playing'){
     let hint=document.querySelector('#play-hint');
     if(!hint){hint=document.createElement('div');hint.id='play-hint';hint.className='hint';screens.root.append(hint);}
     hint.textContent=(replaying?t('replaying')+' · ':'')+(state.config.customLevel?t('editorTest'):t(state.level.id))+' · '+(touch.active?'':tutorialHelp(state.area,input));
    }
   }
  }else if(screens.name==='title'||screens.name==='select')state.frame++;
  acc-=1/F.hz;
 }
 if(steps>=F.maxSteps)acc=0;
 view.render(state,paused||state.hitStop?1:acc*F.hz,paused||state.hitStop?0:dt,!state.players[0].showcase);
 audio.update(state,!!state.players[0].showcase,dt,paused);
 if(screens.name==='options'){
  const status=document.querySelector('#key-status');
  if(status&&input.keys.size)status.textContent=[...input.keys].join(' + ');
 }
 requestAnimationFrame(loop);
}
title();requestAnimationFrame(loop);
