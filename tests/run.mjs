import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import en from '../src/i18n/en.js';
import fr from '../src/i18n/fr.js';
assert.deepEqual(Object.keys(en).sort(),Object.keys(fr).sort());
for(const name of ['LICENSE','ASSETS-BRIEF.md','ASSETS-LICENSE.md','THIRD_PARTY_NOTICES.md','LOB7-GAME.json'])assert(existsSync(name),name);
assert.equal(JSON.parse(readFileSync('LOB7-GAME.json')).entrypoint,'index.html');
console.log('PASS skeleton, legal files, manifest, EN/FR parity');
