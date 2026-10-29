export function record(s){return {version:1,config:{...s.config},inputs:s.log.map(row=>[...row])};}
// Call once per simulated step. Menus and pause never advance this cursor.
export class ReplayCursor {
 constructor(replay){this.config=replay.config;this.inputs=replay.inputs;this.row=0;this.count=0;}
 next(masks){
  const row=this.inputs[this.row];
  if(!row)return false;
  masks[0]=row[1];masks[1]=row[2];
  if(++this.count===row[0]){this.count=0;this.row++;}
  return true;
 }
}
export function validateReplay(replay){if(replay?.version!==1||!replay.config||typeof replay.config.seed!=='string'||!Array.isArray(replay.inputs)||replay.inputs.length>200000)throw new Error('Invalid replay');let frames=0;for(const row of replay.inputs){if(!Array.isArray(row)||row.length!==3||row.some(v=>!Number.isInteger(v))||row[0]<1||row[0]>360000||row[1]<0||row[1]>1023||row[2]<0||row[2]>1023)throw new Error('Invalid input');frames+=row[0];}if(frames>360000)throw new Error('Replay too long');return replay;}
