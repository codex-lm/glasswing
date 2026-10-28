import {F} from '../data/feel.js';
import {heal} from '../core/combat.js';
export function coopTick(s){if(s.players.length<2)return;const [a,b]=s.players;
 // Pull the trailing player to safe support, including a downed teammate, not into a gap.
 if(Math.abs(a.x-b.x)>F.leash){const lead=a.x>b.x?a:b,trail=lead===a?b:a;let x=lead.x-F.leash;while(x<lead.x&&!s.level.grid[0]?.[Math.floor(x)])x++;trail.x=x;trail.px=x;trail.y=Math.max(1,lead.y);trail.py=trail.y;trail.vy=0;}
 for(const p of s.players){if(!p.dead)continue;const helper=s.players.find(other=>!other.dead&&other.mask>=1&&Math.abs(other.x-p.x)<F.reviveRange&&Math.abs(other.y-p.y)<1&&Math.abs(other.vx)<.02);if(helper){p.revive++;if(p.revive>=F.revive){helper.mask=Math.max(0,helper.mask-1);helper.glass=helper.mask===0;p.dead=false;p.mask=1;p.glass=false;p.revive=0;p.inv=F.invincible;p.clip='idle';p.prev=0;s.audio='shard-pickup';}}else p.revive=0;}
}
