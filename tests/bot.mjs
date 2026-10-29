import {B} from '../src/core/input.js';

export function bot(s,index=0){const p=s.players[index];if(s.phase==='altar'||s.phase==='bonus')return s.frame%2?B.attack:0;if(s.phase!=='playing'||p.dead)return 0;const enemies=s.enemies.filter(e=>!e.dead);const target=enemies.sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];let mask=0;

 if(target){const dx=target.x-p.x,dist=Math.abs(dx);if(dist>1.5)mask|=dx>0?B.right:B.left;else if(p.facing!==Math.sign(dx))mask|=dx>0?B.right:B.left;

  if(s.frame%22===0)mask|=B.sword;

  if(target.y>p.y+.45&&s.frame%30<15)mask|=B.jump;if(target.y<p.y-.7)mask|=B.down;

  if(target.ai==='telegraph'&&target.aiTimer<6&&dist<2.3&&p.grounded){mask|=B.block;mask&=~(B.left|B.right);}

  if(target.boss){if(s.frame%40<20)mask|=B.jump;if(target.ai==='attack'&&dist<3&&p.dodgeCd===0)mask|=B.dodge;}

  if(dist>3&&s.frame%40<2)mask|=B.blast;

 }else{mask=B.right;if(s.frame%22===0)mask|=B.sword;}

 const danger=enemies.find(e=>e.ai==='attack'&&Math.abs(e.x-p.x)<(e.boss?4:2));if(danger&&p.dodgeCd===0&&p.inv===0)mask|=B.dodge;
 const orb=s.projectiles.find(o=>o.active&&o.team!==p.team&&Math.abs(o.x-p.x)<1&&Math.abs(o.y-p.y-.7)<.8);if(orb&&p.grounded&&(orb.x-p.x)*p.facing>0)mask|=B.block;
 const ahead=Math.floor(p.x+(mask&B.left?-.8:.8));if((!s.level.grid[0][ahead]||s.level.grid[1]?.[ahead]===4)&&p.grounded)mask|=B.jump;

 if(!s.level.grid[0][Math.floor(p.x)]||!s.level.grid[0][Math.floor(p.x+.8)]){mask=(mask&~B.left)|B.right;if(p.grounded){if(!(p.prev&B.jump))mask|=B.jump;else mask&=~B.jump;}else if(p.vy<=0){if(p.jumps<2){if(p.prev&B.jump)mask&=~B.jump;else mask|=B.jump;}else mask|=B.jump;}}

 return mask;

}

