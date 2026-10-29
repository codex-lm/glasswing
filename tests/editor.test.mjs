import assert from 'node:assert/strict';
import {EditorSession} from '../tools/editor-session.js';
import {testLevel} from '../src/data/test-level.js';

const editor=new EditorSession();
assert.equal(editor.remember(),false,'input before the initial load is ignored');
assert.equal(editor.undo(),false);
const first=editor.beginLoad(),second=editor.beginLoad();
assert.equal(editor.accept(testLevel,first),false,'an older fetch cannot win a race');
assert.equal(editor.accept(testLevel,second),true);
assert.notEqual(editor.level,testLevel,'edits own an independent level');
assert.deepEqual(editor.level.secrets,[]);

const pending=editor.beginLoad();
assert(editor.remember());editor.level.grid[1][4]=3;
assert.equal(editor.accept(testLevel,pending),false,'a late import cannot erase intervening painting');
assert.equal(editor.level.grid[1][4],3);
assert(editor.undo());assert.equal(editor.level.grid[1][4],0);

const valid=editor.level,invalid=structuredClone(testLevel);invalid.checkpoints=[];
assert.throws(()=>editor.accept(invalid,editor.beginLoad()));
assert.equal(editor.level,valid,'invalid files retain the current document');
const small=structuredClone(testLevel);small.width=10;small.grid=small.grid.map(row=>row.slice(0,10));
small.end=9;small.checkpoints=[2];small.waves=[];
editor.cursor={x:59,y:20};
assert(editor.accept(small,editor.beginLoad()));
assert.deepEqual(editor.cursor,{x:9,y:3});
assert.equal(editor.history.length,0);
for(let i=0;i<70;i++)editor.remember();
assert.equal(editor.history.length,50,'undo history stays bounded');
console.log('PASS editor: pre-load input, file races, edit precedence, invalid imports, cursor bounds and undo');
