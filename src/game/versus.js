import {entity} from '../core/entity.js';
import {F} from '../data/feel.js';
import {RUN as R,VERSUS as V} from '../data/run.js';

export function resetRound(s){
 for(let i=0;i<s.players.length;i++){
  const old=s.players[i];
  s.players[i]=entity(i+1,old.kind,V.spawnX[i],V.spawnY,i,'normal');
  s.players[i].eye=old.eye;s.players[i].facing=i?-1:1;
 }
 for(const p of s.projectiles)p.active=false;
 s.phase='playing';s.camera.x=s.level.width/2;s.round++;
}

export function versusFlow(s){
 if(s.phase==='round'){if(--s.respawn<=0)resetRound(s);return;}
 let anyDead=false,firstAlive=null;
 for(const p of s.players){
  if(p.y<R.playerFallY){p.dead=true;p.defeatedFrame=s.frame;}
  if(p.dead)anyDead=true;else if(!firstAlive)firstAlive=p;
 }
 if(!anyDead)return;
 s.roundWinner=firstAlive?firstAlive.id-1:-1;
 if(s.roundWinner>=0)s.scores[s.roundWinner]++;
 s.audio='round-win';
 if(s.scores[0]>=V.roundsToWin||s.scores[1]>=V.roundsToWin){
  s.winner=s.scores[0]>=V.roundsToWin?0:1;s.won=true;s.phase='result';
 }else{s.phase='round';s.respawn=F.respawn;}
}

export function arenaHazards(s){
 if(s.level.hazard==='wind'){
  for(const p of s.players)if(!p.dead&&!p.blocking){
   p.x=Math.max(p.w/2,Math.min(s.level.width-p.w/2,p.x+s.level.wind*Math.sin(s.frame/V.windPeriod)));
  }
 }else if(s.level.hazard==='mushrooms'){
  for(const p of s.players){
   if(p.dead||!p.grounded)continue;
   for(const x of s.level.mushrooms||[])if(Math.abs(p.x-x)<V.mushroomRange){
    p.vy=s.level.bounce;p.grounded=false;p.jumps=0;break;
   }
  }
 }
}
