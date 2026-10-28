import {KINDS} from '../data/kinds.js';
import {F,DIFFICULTY,EYES} from '../data/feel.js';
export function entity(id,kind='brawler',x=2,y=1,team=0,difficulty='normal'){
 const k=KINDS[kind],mask=k.mask+DIFFICULTY[difficulty].mask;
 return {id,kind,team,x,y,px:x,py:y,vx:0,vy:0,knockback:0,knockFrames:0,w:k.width,h:k.height,facing:1,grounded:false,coyote:0,jumpBuffer:0,jumps:0,glide:k.glide,prev:0,mask,maxMask:mask,energy:F.energy,glass:false,dead:false,inv:0,stun:0,vulnerable:false,flash:0,blockAge:999,blocking:false,dodge:0,dodgeCd:0,move:null,moveFrame:0,attackId:0,hitIds:[],combo:0,comboTimer:0,charge:0,eye:EYES[team%2],clip:'idle',upgrades:[],kills:0,survived:0,secondUsed:false,revive:0,ai:'idle',aiTimer:0,eliteHits:0,hp:6,defeatedFrame:0};
}
export function remember(e){e.px=e.x;e.py=e.y;}
