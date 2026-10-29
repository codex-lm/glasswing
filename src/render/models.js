import * as T from '../../vendor/build/three.module.js';
import {GLTFLoader} from '../../vendor/examples/jsm/loaders/GLTFLoader.js';
import {SkeletonUtils} from '../../vendor/examples/jsm/utils/SkeletonUtils.js';
import {F, PALETTE} from '../data/feel.js';
import {MOVES} from '../data/moves.js';
import {ENEMIES} from '../data/enemies.js';
import {BOSS} from '../data/boss.js';
import {VISUALS as V} from '../data/visuals.js';

const white = new T.Color(0xffffff);
const loops = new Set(['idle', 'glassidle', 'run', 'move', 'glide', 'block', 'charge']);

export function localAsset(path) {
  if (typeof path !== 'string' || !/^\.?(?:\/?assets\/|\.?\/assets\/)/.test(path) ||
      path.includes('..') || path.includes(':') || path.includes('\\')) {
    throw new Error('Asset must be a local assets/ path');
  }
  return new URL(path, new URL('../../', import.meta.url)).href;
}

export function validateGLB(buffer) {
  const view = new DataView(buffer);
  if (buffer.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67 ||
      view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== buffer.byteLength ||
      view.getUint32(16, true) !== 0x4e4f534a) throw new Error('glTF 2 binary required');
  const length = view.getUint32(12, true);
  if (length > buffer.byteLength - 20) throw new Error('Invalid GLB JSON length');
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, length)).trim());
  for (const ext of [...json.extensionsUsed || [], ...json.extensionsRequired || []]) {
    if (/draco|basisu|meshopt/i.test(ext)) throw new Error('Compressed models are not supported');
  }
  for (const value of [...json.buffers || [], ...json.images || []]) {
    if (value.uri && !value.uri.startsWith('data:')) throw new Error('All model resources must be embedded');
  }
  return json;
}

export function expiredModel(entity, frame) {
  return entity.dead && entity.team === 2 && frame - entity.defeatedFrame > V.defeatedLife;
}

export class ModelBank {
  constructor() {
    this.cache = new Map();
    this.pending = new Set();
    this.failed = new Set();
  }

  async load(key, path) {
    if (!path || this.cache.has(key) || this.pending.has(key) || this.failed.has(key)) return;
    this.pending.add(key);
    try {
      const response = await fetch(localAsset(path));
      if (!response.ok) throw new Error('Missing asset');
      const data = await response.arrayBuffer();
      validateGLB(data);
      const gltf = await new Promise((resolve, reject) => new GLTFLoader().parse(data, '', resolve, reject));
      this.cache.set(key, gltf);
    } catch {
      this.failed.add(key);
    } finally {
      this.pending.delete(key);
    }
  }

  instantiate(key, eye) {
    const asset = this.cache.get(key);
    if (!asset) return null;
    const group = SkeletonUtils.clone(asset.scene);
    const materials = new Map(), skeletons = new Set();
    const masks = [], halfMasks = [], cracks = [], shards = [];
    const tint = new T.Color(eye).convertSRGBToLinear();

    const cloneMaterial = source => {
      if (materials.has(source)) return materials.get(source).material;
      const material = source.clone(), name = material.name.toLowerCase();
      const glowing = name === 'eyes' || name === 'palms';
      const body = /^(body|wings?|sword)(?:[._-]|$)/.test(name);
      if (glowing) {
        material.color?.copy(tint);
        material.emissive?.copy(tint);
        material.emissiveIntensity = Math.max(1, material.emissiveIntensity || 0);
      } else if (body) material.color?.set(PALETTE.body).convertSRGBToLinear();
      else if (name === 'mask') material.color?.set(PALETTE.mask).convertSRGBToLinear();
      materials.set(source, {
        material, name, glowing, body,
        color: material.color?.clone(), emissive: material.emissive?.clone(),
        intensity: material.emissiveIntensity
      });
      return material;
    };

    // Cache named parts once. A rendered frame never traverses the imported graph.
    group.traverse(node => {
      if (node.isMesh) {
        node.material = Array.isArray(node.material) ? node.material.map(cloneMaterial) : cloneMaterial(node.material);
        if (node.isSkinnedMesh) skeletons.add(node.skeleton);
      }
      if (node.name === 'mask') masks.push(node);
      if (node.name === 'halfmask') halfMasks.push(node);
      const crack = /^crack([123])$/.exec(node.name);
      if (crack) cracks.push({node, index: Number(crack[1])});
      const shard = /^shard([1-8])$/.exec(node.name);
      if (shard) {
        const index = Number(shard[1]);
        shards.push({node, index, x: Math.cos(index), y: Math.sin(index),
          position: node.position.clone(), rotation: node.quaternion.clone()});
      }
    });
    const mixer = new T.AnimationMixer(group);
    const clips = new Map(asset.animations.map(clip => [clip.name, mixer.clipAction(clip)]));
    return {
      group, mixer, clips, materials: [...materials.values()], skeletons,
      masks, halfMasks, cracks, shards, current: null, action: null, attackId: -1,
      wasGlass: false, shardAge: V.shardLife, disposed: false
    };
  }

  animate(model, e, delta) {
    let name = e.dead ? 'beaten' : e.clip;
    if (name === 'jump' && e.jumps > 1 && e.vy > 0) name = 'doublejump';
    const action = model.clips.get(name) || model.clips.get('idle');
    const restart = !!e.move && model.attackId !== e.attackId;
    if (model.action !== action || model.current !== name || restart) {
      if (model.action && model.action !== action) model.action.fadeOut(V.blendSeconds);
      action?.reset().fadeIn(V.blendSeconds).play();
      model.action = action;
      model.current = name;
      model.attackId = e.attackId;
    }
    if (action) {
      let progress = null;
      if (!e.dead && e.move && MOVES[e.move]) progress = e.moveFrame / MOVES[e.move].total;
      else if (!e.dead && e.team === 2 && (e.ai === 'telegraph' || e.ai === 'attack')) {
        const data = e.boss ? BOSS : ENEMIES[e.kind];
        const frames = e.ai === 'attack' ? data.active : e.charging ? data.chargeTelegraph : data.telegraph;
        progress = 1 - e.aiTimer / frames;
      }
      // Frame data remains authoritative even when a delivered clip has another duration.
      const looping = progress === null && loops.has(action.getClip().name);
      action.setLoop(looping ? T.LoopRepeat : T.LoopOnce, looping ? Infinity : 1);
      action.clampWhenFinished = !looping;
      action.paused = progress !== null || action.paused && !looping && action.time >= action.getClip().duration;
      if (progress !== null) action.time = Math.max(0, Math.min(1, progress)) * action.getClip().duration;
    }
    model.mixer.update(delta);
  }

  pose(model, e, delta, alpha = 1, frame = 0) {
    if (e.glass && !model.wasGlass) model.shardAge = 0;
    model.wasGlass = e.glass;
    model.shardAge += delta * F.hz;
    this.animate(model, e, delta);
    const rise = e.dead && e.team === 2 ? (frame - e.defeatedFrame) * V.defeatedRise : 0;
    model.group.position.set(e.px + (e.x - e.px) * alpha, e.py + (e.y - e.py) * alpha + rise, 0);
    model.group.rotation.y = e.facing < 0 ? Math.PI : 0;
    // Files use tile units, including the already three-times-tall authored boss.
    model.group.scale.setScalar(e.showcase ? V.showcaseScale : 1);
    model.group.visible = !expiredModel(e, frame) && !(e.inv && !e.dead && Math.floor(frame / V.blinkFrames) % 2);
    const hasMask = !e.glass && (e.team !== 2 || e.boss);
    for (const node of model.masks) node.visible = hasMask;
    for (const node of model.halfMasks) node.visible = !e.glass && e.eliteHits > 0;
    for (const {node, index} of model.cracks) {
      node.visible = hasMask && index <= Math.ceil((1 - e.mask / e.maxMask) * 3);
    }
    for (const shard of model.shards) {
      const {node, position, rotation, index} = shard, age = model.shardAge;
      node.visible = e.glass && age < V.shardLife;
      node.position.copy(position);
      node.quaternion.copy(rotation);
      if (node.visible) {
        node.position.x += shard.x * age * V.shardSpeed;
        node.position.y += shard.y * age * V.shardSpeed - age * age * V.shardGravity;
        node.rotateZ(age * V.shardSpin * index);
      }
    }
    const eyeFlash = e.ai === 'telegraph' && Math.floor(frame / V.telegraphBlink) % 2;
    for (const record of model.materials) {
      const {material, name, color, emissive, intensity} = record;
      if (color) material.color.copy(color);
      if (emissive) material.emissive.copy(emissive);
      material.emissiveIntensity = intensity;
      const flash = record.body && e.flash > 0 || name === 'mask' && e.parryFlash > 0 || name === 'eyes' && eyeFlash;
      if (flash) {
        material.color?.copy(white);
        material.emissive?.copy(white);
        material.emissiveIntensity = 1;
      } else if (record.glowing) {
        material.emissiveIntensity = intensity * (name === 'palms' && e.charge ? V.chargeGlow : e.glass ? V.glassGlow : 1);
      }
    }
  }

  dispose(model) {
    if (model.disposed) return;
    model.disposed = true;
    model.group.parent?.remove(model.group);
    model.mixer.stopAllAction();
    model.mixer.uncacheRoot(model.group);
    for (const {material} of model.materials) material.dispose();
    for (const skeleton of model.skeletons) skeleton.dispose();
    // Geometry and embedded textures belong to the bank cache, not this instance.
  }
}
