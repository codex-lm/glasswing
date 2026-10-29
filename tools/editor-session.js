import {validateLevel} from '../src/game/level.js';

export class EditorSession {
 constructor(){this.level=null;this.history=[];this.cursor={x:3,y:1};this.revision=0;}
 beginLoad(){return ++this.revision;}
 accept(candidate,revision){
  if(revision!==this.revision)return false;
  const level=structuredClone(validateLevel(candidate));
  level.waves??=[];level.pieces??=[];level.secrets??=[];
  this.level=level;this.history=[];this.clampCursor();
  return true;
 }
 clampCursor(){
  if(!this.level)return;
  this.cursor.x=Math.max(0,Math.min(this.level.width-1,this.cursor.x));
  this.cursor.y=Math.max(0,Math.min(this.level.grid.length-1,this.cursor.y));
 }
 remember(){
  if(!this.level)return false;
  // Editing an existing level takes precedence over a still-pending file load.
  this.revision++;
  this.history.push(JSON.stringify(this.level));
  if(this.history.length>50)this.history.shift();
  return true;
 }
 undo(){
  if(!this.history.length)return false;
  this.revision++;
  this.level=JSON.parse(this.history.pop());this.clampCursor();
  return true;
 }
}
