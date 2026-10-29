import {View} from '../src/render/scene.js';
import {loadManifest} from '../src/ui/assets.js';
import {entity} from '../src/core/entity.js';
import {testLevel} from '../src/data/test-level.js';
import {t} from '../src/ui/i18n.js';
import {F} from '../src/data/feel.js';

await loadManifest('../assets/manifest.test.json');
const view = new View(document.querySelector('#world'));
view.setLevel(testLevel);
const player = entity(1, 'brawler', 9, 1);
player.eye = '#3DE8FF';
const state = {players: [player], enemies: [], frame: 0, camera: {x: 9, y: 5}};
let pose = 'normal', paused = false, resets = 0, last = 0, accumulator = 0;
const choices = ['normal', 'hit', 'glass', 'telegraph', 'downed', 'boss'];
const hud = document.querySelector('#hud');
hud.style.pointerEvents = 'auto';
hud.innerHTML = `<div class="hudbox"><h3>${t('assetCheck')}</h3>
  <label>${t('assetPose')} <select id="pose">${choices.map(name => `<option value="${name}">${t('assetPose_' + name)}</option>`).join('')}</select></label>
  <button id="reset">${t('retry')}</button><button id="pause">${t('action_pause')}</button>
  <output id="asset-result"></output></div>`;
document.querySelector('#pose').addEventListener('change', event => {
  pose = event.target.value;
  view.setLevel(testLevel);
  Object.assign(player, entity(1, 'brawler', 9, 1), {eye: '#3DE8FF'});
  state.frame = 0;
});
document.querySelector('#reset').addEventListener('click', () => {view.setLevel(testLevel); resets++;});
document.querySelector('#pause').addEventListener('click', event => {
  paused = !paused;
  event.target.textContent = t(paused ? 'resume' : 'action_pause');
});

function frame(now) {
  const delta = Math.min(last ? (now - last) / 1000 : 1 / F.hz, .1);
  last = now;
  if (!paused) {
    accumulator += delta;
    while (accumulator >= 1 / F.hz) {state.frame++; accumulator -= 1 / F.hz;}
  }
  player.clip = pose === 'downed' ? 'beaten' : pose === 'telegraph' ? 'telegraph' : 'run';
  player.dead = pose === 'downed';
  player.glass = pose === 'glass';
  player.flash = pose === 'hit' ? F.flash : 0;
  player.boss = pose === 'boss';
  player.ai = pose === 'telegraph' ? 'telegraph' : 'idle';
  view.render(state, 1, paused ? 0 : delta);
  const model = view.models.get(1);
  document.querySelector('#asset-result').textContent = JSON.stringify({
    models: view.models.size, clips: model?.clips.size || 0, set: view.setInstalled,
    pending: view.bank.pending.size, failed: [...view.bank.failed],
    drawCalls: view.stats.calls, geometries: view.renderer?.info.memory.geometries,
    textures: view.renderer?.info.memory.textures, resets, frame: state.frame,
    visible: model?.group.visible, scale: model?.group.scale.x, paused
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
