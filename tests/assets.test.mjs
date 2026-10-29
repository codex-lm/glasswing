import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../vendor/build/three.module.js';
import {GLTFLoader} from '../vendor/examples/jsm/loaders/GLTFLoader.js';
import {ModelBank, validateGLB, expiredModel} from '../src/render/models.js';
import {entity} from '../src/core/entity.js';
import {MOVES} from '../src/data/moves.js';
import {ENEMIES} from '../src/data/enemies.js';

function arrayBuffer(file) {
  const bytes = readFileSync(file);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
const parse = buffer => new Promise((resolve, reject) => new GLTFLoader().parse(buffer, '', resolve, reject));
const array = arrayBuffer('assets/test/dummy-character.glb'), json = validateGLB(array);
assert.equal(json.animations.length, 30);
const gltf = await parse(array), bank = new ModelBank();
bank.cache.set('fixture', gltf);
const a = bank.instantiate('fixture', '#3DE8FF'), b = bank.instantiate('fixture', '#FF8A3D');
const part = (model, name) => model.group.getObjectByName(name);
const srgb = material => material.color.clone().convertLinearToSRGB().toArray()
  .map(channel => Math.round(channel * 255).toString(16).padStart(2, '0')).join('');
assert.notEqual(a.group, b.group);
assert.notEqual(part(a, 'body').skeleton.bones[0], part(b, 'body').skeleton.bones[0]);
assert.equal(srgb(part(a, 'eyes').material), '3de8ff');
assert.equal(srgb(part(b, 'eyes').material), 'ff8a3d');
assert.equal(part(a, 'wing0').material, part(a, 'wing1').material, 'one clone per shared source material');
assert.notEqual(part(a, 'body').material, part(b, 'body').material);

const p = entity(1);
p.clip = 'run';
p.mask = 2;
bank.pose(a, p, 1 / 60);
assert(part(a, 'crack1').visible);
assert.equal(srgb(part(a, 'mask').material), 'f1ece2');
p.flash = 4;
bank.pose(a, p, 0);
assert.equal(part(a, 'body').material.color.getHex(), 0xffffff);
assert.equal(srgb(part(b, 'body').material), '0b0b0d', 'hit flash cannot affect a neighbour');
p.flash = 0;
p.parryFlash = 10;
bank.pose(a, p, 0);
assert.equal(srgb(part(a, 'body').material), '0b0b0d', 'flash restores the black body');
assert.equal(part(a, 'mask').material.color.getHex(), 0xffffff);
p.parryFlash = 0;
p.glass = true;
bank.pose(a, p, 1 / 60);
assert(!part(a, 'mask').visible);
assert(part(a, 'shard1').visible);
assert(part(b, 'mask').visible);
assert.equal(part(a, 'eyes').material.emissiveIntensity, 2);
p.charge = 12;
bank.pose(a, p, 0);
assert.equal(part(a, 'palms').material.emissiveIntensity, 3);
assert.equal(part(b, 'palms').material.emissiveIntensity, 1);
p.charge = 0;
const shardAge = a.shardAge, shardPose = part(a, 'shard1').position.clone();
bank.pose(a, p, 0);
assert.equal(a.shardAge, shardAge, 'pause/hit stop freeze shard movement');
assert(part(a, 'shard1').position.equals(shardPose));
p.glass = false;
bank.pose(a, p, 0);
assert(!part(a, 'shard1').visible);
assert.equal(part(a, 'palms').material.emissiveIntensity, 1, 'heal restores normal glow');
assert(part(a, 'shard1').quaternion.equals(a.shards[0].rotation), 'heal restores shard rotation');

p.inv = 48;
bank.pose(a, p, 0, 1, 4);
assert(!a.group.visible, 'invincibility blinks on the simulation clock');
p.dead = true;
bank.pose(a, p, 1 / 60, 1, 400);
assert(a.group.visible, 'a downed partner stays visible and revivable');
assert(!expiredModel(p, 400));
const enemy = entity(2, 'brawler', 5, 1, 2);
bank.pose(b, enemy, 0);
assert(!part(b, 'mask').visible, 'wild Glasswings have no full mask');
enemy.eliteHits = 2;
bank.pose(b, enemy, 0);
assert(part(b, 'halfmask').visible);
enemy.ai = 'telegraph';
enemy.clip = 'telegraph';
enemy.aiTimer = ENEMIES.brawler.telegraph / 2;
bank.pose(b, enemy, 0, 1, 3);
assert.equal(part(b, 'eyes').material.color.getHex(), 0xffffff, 'telegraph flashes eyes');
assert.equal(b.action.time, b.action.getClip().duration / 2);
enemy.dead = true;
bank.pose(b, enemy, 0, 1, 40);
assert.equal(b.group.position.y, 2, 'wild defeat floats upward');
bank.pose(b, enemy, 0, 1, 51);
assert(!b.group.visible);
assert(expiredModel(enemy, 51));

p.dead = false;
p.inv = 0;
p.move = 'sword';
p.clip = 'sword';
p.attackId++;
p.moveFrame = MOVES.sword.total / 2;
bank.pose(a, p, 1 / 60);
assert.equal(a.action.time, a.action.getClip().duration / 2, 'attack uses simulation frame data');
const attackTime = a.action.time;
bank.pose(a, p, 0);
assert.equal(a.action.time, attackTime);
p.attackId++;
p.moveFrame = 0;
bank.pose(a, p, 1 / 60);
assert.equal(a.action.time, 0, 'repeated identical attack restarts');
p.move = null;
p.clip = 'missing-optional-clip';
bank.pose(a, p, .1);
assert.equal(a.action, a.clips.get('idle'));
p.clip = 'run';
bank.pose(a, p, .2);
assert.equal(a.clips.get('idle').getEffectiveWeight(), 0, 'fallback action actually fades out');
bank.pose(a, p, .2);
assert(a.clips.get('run').time > 0, 'locomotion resumes after a frame-driven attack');

const bossAsset = await parse(arrayBuffer('assets/test/dummy-boss.glb'));
bank.cache.set('boss-fixture', bossAsset);
const boss = bank.instantiate('boss-fixture', '#19B8A6'), bossEntity = entity(3);
bossEntity.boss = true;
bank.pose(boss, bossEntity, 0);
assert.equal(boss.group.scale.x, 1, 'authored boss scale is not multiplied again');
assert.equal(part(boss, 'mask').scale.y, part(b, 'mask').scale.y * 3);
function skinBounds(model) {
  model.group.updateMatrixWorld(true);
  const mesh = part(model, 'body'), bounds = new T.Box3(), point = new T.Vector3();
  mesh.skeleton.update();
  for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
    point.fromBufferAttribute(mesh.geometry.attributes.position, i);
    mesh.boneTransform(i, point);
    bounds.expandByPoint(point.applyMatrix4(mesh.matrixWorld));
  }
  return bounds;
}
const base = bank.instantiate('fixture', '#3DE8FF');
bank.pose(base, entity(4), 0);
const normalBounds = skinBounds(base), bossBounds = skinBounds(boss);
assert(Math.abs(bossBounds.max.y - bossEntity.y - (normalBounds.max.y - 1) * 3) < .00001,
  'skinned boss vertices are baked at three times the normal height');
assert(normalBounds.min.y > 1 && bossBounds.min.y > 1, 'bind-pose body stays above the feet');
bank.dispose(base);

let materialsDisposed = 0, geometryDisposed = 0, skeletonsDisposed = 0;
for (const {material} of a.materials) material.addEventListener('dispose', () => materialsDisposed++);
part(a, 'body').geometry.addEventListener('dispose', () => geometryDisposed++);
for (const skeleton of a.skeletons) {
  skeleton.boneTexture = new T.DataTexture(new Float32Array(16), 1, 4, T.RGBAFormat, T.FloatType);
  skeleton.boneTexture.addEventListener('dispose', () => skeletonsDisposed++);
}
new T.Scene().add(a.group);
bank.dispose(a);
bank.dispose(a);
assert.equal(a.group.parent, null);
assert.equal(materialsDisposed, a.materials.length, 'own materials disposed exactly once');
assert.equal(skeletonsDisposed, a.skeletons.size, 'own GPU skin textures disposed');
assert.equal(geometryDisposed, 0, 'shared geometry remains usable by other instances');
assert.equal(a.mixer.stats.actions.inUse, 0);
assert.equal(a.mixer.stats.bindings.inUse, 0);

const setAsset = await parse(arrayBuffer('assets/test/dummy-set.glb'));
for (const name of ['ground-1', 'platform', 'tree-1', 'fern', 'altar']) assert(setAsset.scene.getObjectByName(name));
function malformed(change) {
  const copy = structuredClone(json);
  change(copy);
  const bytes = new TextEncoder().encode(JSON.stringify(copy)), n = Math.ceil(bytes.length / 4) * 4;
  const bin = new ArrayBuffer(20 + n), view = new DataView(bin);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, bin.byteLength, true);
  view.setUint32(12, n, true);
  view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(bin, 20, n).fill(32);
  new Uint8Array(bin, 20, bytes.length).set(bytes);
  return bin;
}
assert.throws(() => validateGLB(malformed(j => j.buffers[0].uri = 'https://example.invalid/model.bin')));
assert.throws(() => validateGLB(malformed(j => j.extensionsRequired = ['KHR_draco_mesh_compression'])));
assert.throws(() => validateGLB(new ArrayBuffer(4)));
console.log('PASS GLB: isolated skins/materials, hit/parry/telegraph feedback, masks, defeat/revive visibility, frame-driven clips, boss units, disposal and embedded-only assets');
