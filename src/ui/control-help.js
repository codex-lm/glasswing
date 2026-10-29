import {t} from './i18n.js';

const namedKeys={
 Space:'keySpace',Enter:'keyEnter',Escape:'keyEscape',Backspace:'keyBackspace',
 ShiftLeft:'keyShift',ShiftRight:'keyShift',ControlLeft:'keyCtrl',ControlRight:'keyCtrl',
 AltLeft:'keyAlt',AltRight:'keyAlt',ArrowLeft:'keyLeft',ArrowRight:'keyRight',
 ArrowUp:'keyUp',ArrowDown:'keyDown'
};
export function keyLabel(code){
 if(namedKeys[code])return t(namedKeys[code]);
 // Letters, digits and unknown remapped key codes are input data, not prose.
 return code.replace(/^(Key|Digit)/,'');
}

export function bindingLabels(map,all=false){
 const result={};
 for(const [action,codes] of Object.entries(map)){
  result[action]=all?[...new Set(codes.map(keyLabel))].join(' / '):keyLabel(codes[0]);
 }
 return result;
}

export function soloHelp(maps){return t('controls',bindingLabels(maps.solo,true));}
export function twoPlayerHelp(maps){
 return ['p1','p2'].map(id=>t('playerControls',{player:t(id),...bindingLabels(maps[id])})).join('\n');
}
export function tutorialHelp(area,input){
 return input.multi?twoPlayerHelp(input.maps):t('tutorial'+(area+1),bindingLabels(input.maps.solo));
}
