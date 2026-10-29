import {t,setLanguage} from '../src/ui/i18n.js';
import {loadSave} from '../src/core/save.js';
import {validateLevel} from '../src/game/level.js';
import {download} from '../src/ui/results.js';
import {EditorSession} from './editor-session.js';

setLanguage(loadSave().settings.language);
const root=document.querySelector('#editor'),session=new EditorSession();
let brush='1',painting=false;
const brushes=['0','1','2','3','4','5','start','end','checkpoint','fragment','mask','brawler','skimmer','spark','tree-1','fern','mushroom','altar'];
root.innerHTML=`<div class="eyebrow">${t('title')}</div><h1>${t('editor')}</h1><p>${t('editorIntro')}</p><div class="toolbar"><label>${t('loadArea')}<select id="area">${['landing','canopy','hollow','nest'].map(id=>`<option value="${id}">${t(id)}</option>`).join('')}</select></label><button id="load">${t('load')}</button><label>${t('brush')}<select id="brush">${brushes.map(id=>`<option value="${id}">${t('brush_'+id)}</option>`).join('')}</select></label><button id="undo">${t('undo')}</button><button id="export">${t('exportLevel')}</button><label>${t('importLevel')}<input type="file" id="import" accept=".json"></label><button id="test" class="primary">${t('testLevel')}</button><a href="../index.html">${t('home')}</a></div><p id="editor-status"></p><div class="viewport"><canvas id="grid" width="1440" height="240" tabindex="0" aria-label="${t('levelGrid')}"></canvas></div><p id="coordinates"></p><p>${t('editorKeys')}</p>`;
const canvas=document.querySelector('#grid'),ctx=canvas.getContext('2d');
const status=document.querySelector('#editor-status'),cell=24;
const colors=['#cfe9f2','#3f7d4f','#a9d68a','#d3c48a','#b6956d','#79e0c8'];

function draw(){
 const {level,cursor}=session;
 document.querySelector('#export').disabled=!level;
 document.querySelector('#test').disabled=!level;
 document.querySelector('#undo').disabled=!session.history.length;
 if(!level)return;
 canvas.width=level.width*cell;canvas.height=level.grid.length*cell;
 ctx.font='bold 14px Nunito';
 for(let y=0;y<level.grid.length;y++)for(let x=0;x<level.width;x++){
  ctx.fillStyle=colors[level.grid[y][x]];
  ctx.fillRect(x*cell,(level.grid.length-1-y)*cell,cell,cell);
  ctx.strokeStyle='#1e242020';ctx.strokeRect(x*cell,(level.grid.length-1-y)*cell,cell,cell);
 }
 function mark(x,y,text,color){
  ctx.fillStyle=color;ctx.fillText(text,x*cell+3,(level.grid.length-y)*cell-5);
 }
 mark(level.start.x,level.start.y,'▶','#163b31');
 mark(level.end,1,'⚑','#9d5539');
 for(const checkpoint of level.checkpoints)mark(checkpoint,0,'◆','#ffe24a');
 for(const secret of level.secrets)mark(secret.x,secret.y,secret.type==='fragment'?'✦':'◉','#925080');
 for(const piece of level.pieces)mark(piece.x,piece.y,'♣','#294d36');
 for(const wave of level.waves)for(const enemy of wave.enemies)
  mark(enemy.x,enemy.y||1,enemy.kind.slice(0,1).toUpperCase(),'#0b0b0d');
 ctx.strokeStyle='#ff8a3d';ctx.lineWidth=2;
 ctx.strokeRect(cursor.x*cell,(level.grid.length-1-cursor.y)*cell,cell,cell);
 document.querySelector('#coordinates').textContent=t('editorCoordinates',cursor);
}

function paint(x,y,erase=false){
 const level=session.level;
 if(!level||x<0||x>=level.width||y<0||y>=level.grid.length)return;
 session.revision++;session.cursor={x,y};
 if(erase){
  level.grid[y][x]=0;
  const elsewhere=point=>Math.floor(point.x)!==x||Math.floor(point.y)!==y;
  level.secrets=level.secrets.filter(elsewhere);level.pieces=level.pieces.filter(elsewhere);
  for(const wave of level.waves)wave.enemies=wave.enemies.filter(elsewhere);
  level.waves=level.waves.filter(wave=>wave.enemies.length);
 }else if(/^\d$/.test(brush))level.grid[y][x]=Number(brush);
 else if(brush==='start')level.start={x:x+.5,y};
 else if(brush==='end'){level.end=x+.5;level.boss=false;}
 else if(brush==='checkpoint'){
  if(!level.checkpoints.includes(x))level.checkpoints.push(x);
  level.checkpoints.sort((a,b)=>a-b);
 }else if(brush==='fragment'||brush==='mask')level.secrets.push({type:brush,x:x+.5,y:y+.3});
 else if(['brawler','skimmer','spark'].includes(brush)){
  let wave=level.waves.find(wave=>Math.abs(wave.trigger-(x-4))<4&&wave.enemies.length<4);
  if(!wave){
   wave={trigger:Math.max(2,x-4),enemies:[]};level.waves.push(wave);
   level.waves.sort((a,b)=>a.trigger-b.trigger);
  }
  wave.enemies.push({kind:brush,x:x+.5,y,elite:false});
 }else level.pieces.push({piece:brush,x:x+.5,y,z:-1,scale:1});
 draw();status.textContent=t('editorChanged');
}

function accept(level,revision){
 if(!session.accept(level,revision))return;
 painting=false;draw();status.textContent=t('editorLoaded');
}
async function load(id){
 const revision=session.beginLoad();painting=false;status.textContent=t('loading');
 try{
  const response=await fetch(`../src/data/levels/${id}.json`);
  if(!response.ok)throw new Error('Missing level');
  accept(await response.json(),revision);
 }catch{if(revision===session.revision)status.textContent=t('invalidLevel');}
}
function pointerPaint(event,erase){
 const rect=canvas.getBoundingClientRect();
 paint(Math.floor((event.clientX-rect.left)/cell),
  session.level.grid.length-1-Math.floor((event.clientY-rect.top)/cell),erase);
}
canvas.oncontextmenu=event=>event.preventDefault();
canvas.onpointerdown=event=>{
 if(!session.remember())return;
 event.preventDefault();canvas.setPointerCapture(event.pointerId);painting=true;
 pointerPaint(event,event.button===2);
};
canvas.onpointermove=event=>{
 if(painting&&session.level&&/^\d$/.test(brush))pointerPaint(event,event.buttons===2);
};
canvas.onpointerup=canvas.onpointercancel=()=>painting=false;
canvas.onkeydown=event=>{
 if(!session.level)return;
 const key=event.code,cursor=session.cursor;
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Delete'].includes(key))return;
 event.preventDefault();
 if(key==='ArrowLeft')cursor.x--;if(key==='ArrowRight')cursor.x++;
 if(key==='ArrowUp')cursor.y++;if(key==='ArrowDown')cursor.y--;
 session.clampCursor();
 if(key==='Space'||key==='Delete'){
  session.remember();paint(cursor.x,cursor.y,key==='Delete');
 }else draw();
};

document.querySelector('#brush').value=brush;
document.querySelector('#brush').onchange=event=>brush=event.target.value;
document.querySelector('#load').onclick=()=>load(document.querySelector('#area').value);
document.querySelector('#undo').onclick=()=>{
 if(session.undo()){draw();status.textContent=t('editorChanged');}
};
document.querySelector('#export').onclick=()=>{
 try{
  const level=validateLevel(session.level);
  download(JSON.stringify(level,null,2),`${level.id}.json`);status.textContent=t('editorExported');
 }catch{status.textContent=t('invalidLevel');}
};
document.querySelector('#import').onchange=async event=>{
 const file=event.target.files[0];
 if(!file)return;
 const revision=session.beginLoad();painting=false;status.textContent=t('loading');
 try{
  if(file.size>1000000)throw new Error('Level file too large');
  accept(JSON.parse(await file.text()),revision);
 }catch{if(revision===session.revision)status.textContent=t('invalidLevel');}
};
document.querySelector('#test').onclick=()=>{
 try{validateLevel(session.level);}
 catch{status.textContent=t('invalidLevel');return;}
 try{
  localStorage.setItem('glasswing.editor.v1',JSON.stringify(session.level));
  location.href='../index.html?editor=1';
 }catch{status.textContent=t('editorStorage');}
};
draw();load('landing');
