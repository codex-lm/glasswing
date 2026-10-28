import {View} from '../src/render/scene.js';
import {loadManifest} from '../src/ui/assets.js';
import {entity} from '../src/core/entity.js';
import {testLevel} from '../src/data/test-level.js';
import {t} from '../src/ui/i18n.js';
await loadManifest('../assets/manifest.test.json');const view=new View(document.querySelector('#world'));view.setLevel(testLevel);const p=entity(1,'brawler',9,1);p.clip='run';p.eye='#3DE8FF';const state={players:[p],enemies:[],frame:0,camera:{x:9,y:5}};let last=0;function frame(now){state.frame++;view.render(state,1,last?(now-last)/1000:1/60);last=now;document.querySelector('#hud').innerHTML=`<div class="hudbox"><h3>${t('assetCheck')}</h3><output id="asset-result">${JSON.stringify({models:view.models.size,clips:view.models.get(1)?.clips.size||0,set:view.setInstalled,pending:view.bank.pending.size,failed:[...view.bank.failed],drawCalls:view.stats.calls})}</output></div>`;requestAnimationFrame(frame);}requestAnimationFrame(frame);
