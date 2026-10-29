import assert from 'node:assert/strict';
import {createRun} from '../src/game/run.js';
import {testLevel} from '../src/data/test-level.js';
import {resultStats,resultsHTML,downloadBlob} from '../src/ui/results.js';
import {setLanguage,t} from '../src/ui/i18n.js';
import {drawSilhouette} from '../src/ui/share-card.js';

const state=createRun([testLevel],{mode:'coop',kind:'brawler',kind2:'spark'});
state.won=true;state.areasCleared=1;state.frame=3661;state.lives=2;
state.players[0].kills=3;state.players[1].kills=4;
state.players[0].survived=1;state.players[1].survived=2;
state.players[0].upgrades=['heavyFists'];state.players[1].upgrades=['longGlide','glassHeart'];
const stats=resultStats(state);
assert.equal(stats.kills,7);assert.equal(stats.breaks,3);
assert.equal(stats.time,61);assert.equal(stats.areaTotal,1);
assert.equal(stats.score,7*5+40+3*15+2*20,'scoring is unchanged');
assert.deepEqual(stats.players[1].upgrades,['longGlide','glassHeart']);
stats.players[1].upgrades.push('secondMask');
assert.equal(state.players[1].upgrades.length,2,'result data does not mutate the run');
for(const locale of ['en','fr']){
 setLanguage(locale);
 const html=resultsHTML(state);
 for(const label of ['p1','p2','brawler','spark','longGlide','glassHeart'])assert(html.includes(t(label)));
 assert(html.includes('1/1'));assert(html.includes('1:01'));
 assert(html.includes(state.players[1].eye),'both eye colours reach the result screen');
}
setLanguage('en');
assert.throws(()=>downloadBlob(null,'empty.png'),'empty canvas exports fail before creating a download');

// Verify structural invariants independently of raster dimensions/font rendering.
function spyCanvas(){
 return {wings:0,glows:0,colors:[],paths:[],fillStyle:'',
  beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){this.colors.push(this.fillStyle);},
  ellipse(...args){this.paths.push(args);},
  bezierCurveTo(){this.wings++;},
  createRadialGradient(){this.glows++;return {addColorStop(){}};}
 };
}
const outlines=[];
for(const kind of ['brawler','skimmer','spark']){
 const ctx=spyCanvas();
 drawSilhouette(ctx,{kind,eye:'#3DE8FF',glass:false},0,0,100);
 assert.equal(ctx.wings,8,'four separate closed wings each have two curved sides');
 assert(ctx.colors.includes('#0b0b0d'));assert(ctx.colors.includes('#f1ece2'));
 assert.equal(ctx.glows,kind==='spark'?2:0,'Spark palms glow while idle');
 outlines.push(JSON.stringify(ctx.paths));
}
assert.equal(new Set(outlines).size,3,'result emblems retain all three proportions');
const glass=spyCanvas();drawSilhouette(glass,{kind:'brawler',eye:'#3DE8FF',glass:true},0,0,100);
assert(!glass.colors.includes('#f1ece2'),'glass mode does not restore a mask on the share card');
assert.equal(glass.glows,2);
console.log('PASS results: both co-op players, complete EN/FR, unchanged scoring, custom-level totals and four-wing kind emblems');
