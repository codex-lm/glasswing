import {t,setLanguage,language} from '../src/ui/i18n.js';
import {createRun,tick} from '../src/game/run.js';
import {loadLevels} from '../src/game/level.js';
import {record,validateReplay} from '../src/core/replay.js';
import {resultsHTML,shareCard,download} from '../src/ui/results.js';
import {createShareCard} from '../src/ui/share-card.js';
import {REPLAY_FILES} from '../src/data/resources.js';

let levels;
const recordings=['normal-brawler','normal-skimmer','normal-spark','coop-brawler-spark'];
const cache=new Map();
let chosen=recordings[0],generation=0;
async function render(){
 const revision=++generation,selection=chosen;
 document.querySelector('#title').textContent=t('resultsCheck');
 document.querySelector('#controls').innerHTML=`<label>${t('verifiedReplays')}<select id="recording">${recordings.map((id,i)=>`<option value="${id}">${t(i===3?'coop':id.slice(7))}</option>`).join('')}</select></label>
 <label>${t('language')}<select id="language"><option value="en">${t('english')}</option><option value="fr">${t('french')}</option></select></label>`;
 const selector=document.querySelector('#recording');selector.value=chosen;
 selector.onchange=()=>{chosen=selector.value;refresh();};
 const locale=document.querySelector('#language');locale.value=language;
 locale.onchange=()=>{setLanguage(locale.value);refresh();};
 if(!cache.has(selection)){
  const response=await fetch(REPLAY_FILES[selection]);
  if(!response.ok)throw new Error('Missing checked replay');
  const replay=validateReplay(await response.json()),state=createRun(levels,replay.config);
  for(const [n,a,b] of replay.inputs)for(let i=0;i<n;i++)tick(state,[a,b]);
  cache.set(selection,state);
 }
 if(revision!==generation)return;
 const state=cache.get(selection),canvas=await createShareCard(state);
 if(revision!==generation)return;
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label',t('shareCard'));
 document.querySelector('#preview').replaceChildren(canvas);
 const root=document.querySelector('#result');root.innerHTML=resultsHTML(state);
 root.querySelector('[data-action="card"]').onclick=async()=>{
  try{await shareCard(state);}catch{root.querySelector('#export-status').textContent=t('exportFailed');}
 };
 root.querySelector('[data-action="retry"]').onclick=refresh;
 root.querySelector('[data-action="home"]').onclick=()=>{location.href='../index.html';};
 root.querySelector('[data-action="replay"]').onclick=()=>download(JSON.stringify(record(state)),'glasswing-replay.json');
}
function failed(){document.querySelector('#result').textContent=t('loadError');}
function refresh(){render().catch(failed);}
loadLevels().then(value=>{levels=value;refresh();}).catch(failed);
