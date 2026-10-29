import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'})
 .trim().split('\n');
const activeAPI=/new\s+(?:Worker|SharedWorker)|WebAssembly|RTCPeerConnection|import\s*\(|new\s+WebSocket/;
const imports=/(?:^|\n)\s*(?:import|export)\s+(?:[^;]*?\sfrom\s+)?['"]([^'"]+)['"]/g;
let size=0,modules=0;
for(const file of files){
 size+=statSync(file).size;
 if(/\.(js|mjs|json|html|md|css)$/.test(file))
  new TextDecoder('utf-8',{fatal:true}).decode(readFileSync(file));
 if(!/\.(js|mjs|html)$/.test(file))continue;
 const source=readFileSync(file,'utf8');
 if(!file.startsWith('vendor/')&&!file.startsWith('tests/')){
  assert(!activeAPI.test(source),`Forbidden active API: ${file}`);
  assert(!/fetch\s*\(\s*['"]https?:/.test(source),`External fetch: ${file}`);
 }
 for(const [,specifier] of source.matchAll(imports)){
  if(file.startsWith('tests/')&&specifier.startsWith('node:'))continue;
  assert(specifier.startsWith('.'),`Nonrelative module: ${file}: ${specifier}`);
  const target=resolve(dirname(file),specifier.split(/[?#]/)[0]);
  assert(!relative(root,target).startsWith('..'),`Module escapes package: ${file}: ${specifier}`);
  assert(existsSync(target)&&statSync(target).isFile(),`Missing module: ${file}: ${specifier}`);
  modules++;
 }
}
assert(!files.includes('package.json'));
assert(!files.some(file=>file.startsWith('SPEC-')));
assert(files.length<500);
assert(size<3000000,`Base package ${size} exceeds 3 MB`);
const manifest=JSON.parse(readFileSync('LOB7-GAME.json','utf8'));
assert.equal(manifest.entrypoint,'index.html');assert(files.includes(manifest.entrypoint));
console.log(`PASS package: ${files.length} files, ${size} bytes, ${modules} resolved module links; local-only active APIs`);
