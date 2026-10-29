// Frame rectangles use feet-relative x/y; x is forward, w is reach. Total <=24 frames.
const move=(startup,active,total,stat,w,y,h,knock=.5,stop=3)=>({startup,active,total,stat,frames:Array.from({length:total},(_,i)=>i>=startup&&i<startup+active?{x:.15,y,w,h,damage:1,knock,stop}:null)});
export const MOVES={punch1:move(4,3,15,'punch',.8,.55,.8),punch2:move(4,3,16,'punch',.8,.55,.8),punch3:move(4,4,20,'punch',.9,.45,1,.9),kick:move(8,4,22,'kick',1.2,.25,.9,.65),divekick:move(8,6,24,'kick',1.2,-.4,1.2,.5),sword:move(6,4,20,'sword',1.8,.45,.65,.5,6),downsword:move(6,6,22,'sword',.65,-1,1.4,.4,6),blast:move(6,1,18,'blast',0,0,0),charge:move(6,1,18,'blast',0,0,0)};
// Enemy rectangles are active only during their data/enemies.js or boss.js window.
export const WILD_HITBOX={forward:.45,extraWidth:1};
export const BOSS_HITBOX={sweepReach:5,bodyReach:1,maxTargetY:2.3};
