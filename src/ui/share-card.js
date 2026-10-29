import {KINDS} from '../data/kinds.js';
import {RESULTS as R} from '../data/results.js';
import {t} from './i18n.js';
import {resultStats,eyeName,duration} from './result-stats.js';

function ellipse(ctx,x,y,rx,ry,rotation=0) {
 ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fill();
}

function shortText(ctx,text,width) {
 text=String(text).replace(/\s+/g,' ');
 if(ctx.measureText(text).width<=width)return text;
 while(text.length&&ctx.measureText(text+'…').width>width)text=text.slice(0,-1);
 return text+'…';
}

function wrapped(ctx,text,x,y,width,maxLines=2,lineHeight=23) {
 const words=String(text).split(/\s+/),lines=[];
 let line='';
 for(const word of words){
  const next=line?line+' '+word:word;
  if(line&&ctx.measureText(next).width>width){lines.push(line);line=word;}
  else line=next;
 }
 if(line)lines.push(line);
 for(let i=0;i<Math.min(lines.length,maxLines);i++){
  const value=i===maxLines-1&&lines.length>maxLines?lines.slice(i).join(' '):lines[i];
  ctx.fillText(shortText(ctx,value,width),x,y+i*lineHeight);
 }
}

function halo(ctx,x,y,r,color) {
 const glow=ctx.createRadialGradient(x,y,0,x,y,r);
 glow.addColorStop(0,color+'aa');glow.addColorStop(1,color+'00');
 ctx.fillStyle=glow;ellipse(ctx,x,y,r,r);
}

function upgradeText(ctx,player,label,x,y,width,maxLines) {
 const names=player.upgrades.map(key=>t(key)),prefix=label?label+': ':'';
 const whole=prefix+(names.join(' · ')||t('none'));
 if(ctx.measureText(whole).width<=width||names.length<2){wrapped(ctx,whole,x,y,width,maxLines,22);return;}
 // Keep complete upgrade names together and balance the two lines.
 let best=null;
 for(let i=1;i<names.length;i++){
  const a=prefix+names.slice(0,i).join(' · '),b=names.slice(i).join(' · ');
  const widest=Math.max(ctx.measureText(a).width,ctx.measureText(b).width);
  if(!best||widest<best.width)best={a,b,width:widest};
 }
 if(best.width<=width){ctx.fillText(best.a,x,y);ctx.fillText(best.b,x,y+22);}
 else wrapped(ctx,whole,x,y,width,maxLines,22);
}

// A standing result emblem preserves kind proportions, four wings and live mask state.
export function drawSilhouette(ctx,player,x,feet,unit) {
 const k=KINDS[player.kind],h=k.height*unit,w=k.bodyWidth*unit,wing=k.wing*unit;
 // Put palm light behind the body so the black silhouette stays solid.
 if(player.kind==='spark')for(const side of [-1,1])halo(ctx,x+side*w*.71,feet-h*.22,unit*.29,player.eye);
 ctx.fillStyle='#0b0b0d';
 for(let i=0;i<4;i++){
  const side=i<2?-1:1,upper=i%2===0,baseX=x+side*w*.4,baseY=feet-h*(upper?.78:.53);
  ctx.beginPath();ctx.moveTo(baseX,baseY);
  ctx.bezierCurveTo(baseX+side*wing*.45,baseY-wing*.12,baseX+side*wing*.7,baseY-wing*(upper?.65:.35),baseX+side*wing*.58,baseY-wing*(upper?.85:.5));
  ctx.bezierCurveTo(baseX+side*wing*.2,baseY-wing*(upper?.7:.35),baseX-side*wing*.1,baseY-wing*.25,baseX,baseY);
  ctx.fill();
 }
 ellipse(ctx,x,feet-h*.46,w*.56,h*.29);
 ellipse(ctx,x,feet-h*.82,w*.58,h*.25);
 for(const side of [-1,1]){
  ellipse(ctx,x+side*w*.25,feet-h*.16,w*.19,h*.18,-side*.12);
  ellipse(ctx,x+side*w*.64,feet-h*.43,w*.23,h*.25,side*.17);
 }
 // The thin needle remains a black part of the silhouette.
 ctx.beginPath();ctx.moveTo(x+w*.59,feet-h*.44);ctx.lineTo(x+w*.7,feet-h*.46);
 ctx.lineTo(x+w*.9,feet-h*.05);ctx.closePath();ctx.fill();
 if(!player.glass){
  ctx.fillStyle='#f1ece2';ellipse(ctx,x,feet-h*.83,w*.52,h*.22);
  ctx.strokeStyle='#5c5650';ctx.lineWidth=Math.max(1,unit*.012);
  const cracks=Math.min(8,Math.max(0,Math.ceil(player.maxMask-player.mask)));
  for(let i=0;i<cracks;i++){
   const cx=x+(i%4-1.5)*w*.16,cy=feet-h*(i<4?.81:.9);
   ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx-w*.025,cy+h*.045);ctx.lineTo(cx+w*.04,cy+h*.08);ctx.stroke();
  }
 }
 for(const side of [-1,1]){
  const ex=x+side*w*.2,ey=feet-h*.88;
  if(player.glass)halo(ctx,ex,ey,w*.45,player.eye);
  ctx.fillStyle=player.eye;ellipse(ctx,ex,ey,Math.max(3,w*.085),Math.max(3,h*.028));
  if(player.kind==='spark'){
   const px=x+side*w*.71,py=feet-h*.22;
   ctx.fillStyle=player.eye;ellipse(ctx,px,py,unit*.065,unit*.065);
  }
 }
}

export async function createShareCard(state) {
 // Explicitly load the bundled fonts before the first canvas text measurement.
 try{await Promise.all([document.fonts.load('600 64px Fredoka'),document.fonts.load('600 22px Nunito')]);}catch{}
 const canvas=document.createElement('canvas');canvas.width=R.cardWidth;canvas.height=R.cardHeight;
 const ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('Canvas unavailable');
 const v=resultStats(state);
 const sky=ctx.createLinearGradient(0,0,0,R.cardHeight);
 sky.addColorStop(0,'#cfe9f2');sky.addColorStop(1,'#a9d68a');
 ctx.fillStyle=sky;ctx.fillRect(0,0,R.cardWidth,R.cardHeight);
 // Soft painted layers leave a quiet light field behind every black silhouette.
 for(let i=0;i<8;i++){
  ctx.fillStyle='#7cae9520';ctx.fillRect(685+i*78,180,14,360);
  ellipse(ctx,695+i*78,195+(i%3)*45,90,65);
 }
 ctx.fillStyle='#c1dda9';ellipse(ctx,935,565,390,105);
 ctx.fillStyle='#a0c58e';ellipse(ctx,1180,605,410,90);
 ctx.fillStyle='#173d30';ctx.font='600 64px Fredoka, sans-serif';ctx.fillText(t('title'),60,87);
 ctx.font='600 29px Nunito, sans-serif';ctx.fillText(shortText(ctx,t(state.won?'victory':'defeat'),610),62,139);
 ctx.font='600 22px Nunito, sans-serif';
 const identities=v.players.map(p=>t(p.kind)+' · '+eyeName(p.eye)).join(' / ');
 ctx.fillText(shortText(ctx,identities,610),62,183);
 const statistics=[['enemiesBeaten',v.kills],['areas',v.areas+'/'+v.areaTotal],['time',duration(v.time)],['survived',v.breaks]];
 statistics.forEach(([label,value],i)=>{
  const x=62+(i%2)*300,y=228+Math.floor(i/2)*91;
  ctx.fillStyle='#365847';ctx.font='600 18px Nunito, sans-serif';ctx.fillText(shortText(ctx,t(label),278),x,y);
  ctx.fillStyle='#173d30';ctx.font='600 38px Fredoka, sans-serif';ctx.fillText(String(value),x,y+43);
 });
 ctx.font='600 20px Nunito, sans-serif';ctx.fillText(t('upgrades'),62,412);
 ctx.font='600 18px Nunito, sans-serif';
 v.players.forEach((player,i)=>{
  upgradeText(ctx,player,v.players.length>1?t(i?'p2':'p1'):'',62,440+i*48,610,v.players.length>1?2:3);
 });
 v.players.forEach((player,i)=>{
  const x=v.players.length>1?815+i*235:935,unit=v.players.length>1?100:150;
  ctx.fillStyle='#3f7d4f25';ellipse(ctx,x,512,v.players.length>1?60:95,14);
  drawSilhouette(ctx,player,x,495,unit);
  if(v.players.length>1){ctx.fillStyle='#173d30';ctx.font='600 18px Nunito, sans-serif';ctx.textAlign='center';ctx.fillText(t(i?'p2':'p1'),x,545);ctx.textAlign='left';}
 });
 ctx.fillStyle='#173d30';ellipse(ctx,1107,76,49,49);
 ctx.fillStyle='#f1ece2';ctx.textAlign='center';
 ctx.font='600 15px Nunito, sans-serif';ctx.fillText(t('rank'),1107,61);
 ctx.font='600 42px Fredoka, sans-serif';ctx.fillText(v.rank,1107,102);ctx.textAlign='left';
 ctx.fillStyle='#365847';ctx.font='600 17px Nunito, sans-serif';
 ctx.fillText(shortText(ctx,t('credit'),1080),62,574);
 ctx.font='600 15px Nunito, sans-serif';ctx.fillText(shortText(ctx,t('seed')+': '+state.seed,1080),62,603);
 return canvas;
}
