import assert from 'node:assert/strict';
import {validSave,validConfig} from '../src/core/save.js';
import {validateReplay} from '../src/core/replay.js';
const save=validSave({version:1,settings:{language:'fr',music:20,sound:-3,maps:{solo:{attack:['KeyZ']}}}});assert.equal(save.settings.music,1);assert.equal(save.settings.sound,0);assert.deepEqual(save.settings.maps.solo.attack,['KeyZ']);assert.throws(()=>validConfig({kind:'wrong'}));assert.throws(()=>validateReplay({version:1,config:{seed:'a'},inputs:[[999999999,0,0]]}));assert.throws(()=>validSave({version:9}));console.log('PASS save validation, bounded replay import, settings clamps and remapping');

import {betterResult} from '../src/ui/results.js';
const win={won:true,score:500,time:100},loss={won:false,score:600,time:80};
assert(!betterResult(loss,win));assert(betterResult(win,loss));assert(betterResult({...win,time:90},win));assert(!betterResult({...win,time:110},win));
console.log('PASS personal best preserves victories and breaks score ties by time');
