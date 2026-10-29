import {F} from '../data/feel.js';
import {RUN as R} from '../data/run.js';

export function coopTick(s){
 if(s.players.length<2)return;
 const [a,b]=s.players;
 // Pull the trailing player to support, including a downed teammate, not into a gap.
 if(Math.abs(a.x-b.x)>F.leash){
  const lead=a.x>b.x?a:b,trail=lead===a?b:a;
  let x=lead.x-F.leash;
  while(x<lead.x&&!s.level.grid[0]?.[Math.floor(x)])x++;
  trail.x=x;trail.px=x;trail.y=Math.max(R.groundY,lead.y);trail.py=trail.y;trail.vy=0;
 }
 for(const p of s.players){
  if(!p.dead)continue;
  let helper=null;
  for(const other of s.players){
   if(!other.dead&&other.mask>=R.reviveMask&&Math.abs(other.x-p.x)<F.reviveRange&&
      Math.abs(other.y-p.y)<R.reviveHeight&&Math.abs(other.vx)<R.reviveMaxSpeed){helper=other;break;}
  }
  if(!helper){p.revive=0;continue;}
  p.revive++;
  if(p.revive>=F.revive){
   helper.mask=Math.max(0,helper.mask-R.reviveMask);helper.glass=helper.mask===0;
   p.dead=false;p.mask=R.reviveMask;p.glass=false;p.revive=0;p.inv=F.invincible;
   p.clip='idle';p.prev=0;s.audio='shard-pickup';
  }
 }
}
