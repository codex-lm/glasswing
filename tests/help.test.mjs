import assert from 'node:assert/strict';
import {DEFAULT_KEYS} from '../src/core/input.js';
import {setLanguage,t} from '../src/ui/i18n.js';
import {soloHelp,twoPlayerHelp,tutorialHelp,keyLabel} from '../src/ui/control-help.js';
import {hudMarkup,hud} from '../src/ui/hud.js';
import {createRun} from '../src/game/run.js';
import {testLevel} from '../src/data/test-level.js';

const maps=structuredClone(DEFAULT_KEYS);
maps.solo.attack=['KeyQ'];maps.solo.sword=['KeyE'];maps.solo.block=['KeyV'];
maps.p1.blast=['KeyZ'];maps.p2.blast=['KeyM'];
for(const language of ['en','fr']){
 setLanguage(language);
 const help=soloHelp(maps),pair=twoPlayerHelp(maps);
 assert(!help.includes('{'));assert(!pair.includes('{'));
 assert(help.includes('Q'));assert(help.includes('E'));assert(help.includes('V'));
 assert(!help.includes('KeyQ'));assert(!help.includes('KeyE'));
 assert(pair.includes('Z'));assert(pair.includes('M'));
 assert(tutorialHelp(0,{maps,multi:false}).includes('Q'));
 assert(tutorialHelp(2,{maps,multi:false}).includes('V'));
 assert.equal(tutorialHelp(1,{maps,multi:true}),pair);
 assert.equal(keyLabel('Space'),t('keySpace'));

 const state=createRun([testLevel],{mode:'coop'});
 state.players[0].dead=true;state.players[0].revive=60;
 state.players[1].glass=true;state.players[1].upgrades=['glassHeart','deepReserve'];
 const html=hudMarkup(state);
 assert(html.includes('50%'));assert(html.includes('×4'));
 assert(html.includes(t('p1')));assert(html.includes(t('p2')));
 assert(html.includes('aria-valuemax="8"'));assert(html.includes('role="meter"'));
}
setLanguage('en');

// A stable HUD must preserve nodes; clearing it for the title must rebuild on resume.
const originalDocument=globalThis.document,state=createRun([testLevel]);
let writes=0;
const root={childElementCount:0,set innerHTML(value){writes++;this.childElementCount=1;}};
globalThis.document={querySelector:selector=>selector==='#hud'?root:{classList:{toggle(){}}}};
try{
 hud(state);hud(state);assert.equal(writes,1);
 state.players[0].mask--;hud(state);assert.equal(writes,2);
 root.childElementCount=0;hud(state);assert.equal(writes,3);
}finally{globalThis.document=originalDocument;}
console.log('PASS localized remapped help, co-op identities, HUD meters and unchanged-node reuse');
