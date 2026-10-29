# Glasswing

A fast 2.5D forest action game designed by Charles. Four black wings, a white mask, and a glass-cannon comeback. Produced by Cédric Bernadac; implemented by Nilo with Codex.

Serve this directory with `python -m http.server 8000`, then open http://localhost:8000 . No install or build. Run tests with Node 22+ using `node tests/run.mjs`.

The current delivery checkpoint and remaining work are in FINAL-REPORT.md. Implementation and acceptance evidence are recorded in PROGRESS.md. Publication on LOB7 is performed separately from claude.ai after delivery of a tagged commit.

## Play

Solo: arrows or WASD to move; Space / W / Up to jump, again for a double jump, hold to glide. J punches, moving + J or Down + J kicks. K swings the needle-sword; Down + K in the air pogos. L fires on release; hold to charge. Shift / I dodges. U / Ctrl guards; tap just before a hit for a perfect parry. Escape / P pauses. Every key can be remapped in Options.

Your white mask is your life. At zero points it shatters: damage ×3, movement +20%, free blasts, but the next hit is fatal. A shard repairs one point. Three lives; checkpoints every 20 tiles. Three altars offer upgrades with one action. Four fragments unlock one extra choice in the Nest. Defeat the Old Glasswing after its final broken-mask rush.

Gamepad: left stick/d-pad; bottom face button jump, left attack, top sword, right blast, right bumper dodge, left bumper guard, Start pause. Menus use directions and the bottom button. One pad in two-player mode is P2; two pads map P1/P2. Physical pad testing is still needed.

## Structure and media

`src/core/` is DOM-free simulation apart from the input adapter; `src/game/` holds run flow and AI, `src/data/` holds tuning/frame data and level JSON. `src/render/` uses unmodified vendored Three.js r128 in its official directory structure. `src/ui/` provides screens, localization, saves, asset/audio adapters. No build step, network service, or package.json.

See ASSETS-BRIEF.md for exact model, clip, music and cue names. Add embedded uncompressed GLBs under assets/models and map `"brawler":"assets/models/brawler.glb"` in assets/manifest.json. Missing entries keep the procedural model. Maps reject external resource URIs and compressed models. No external music or recordings are delivered yet; short original oscillator sounds provide feedback. Music and sound sliders are independent. Add `{"ogg":"assets/audio/music/forest.ogg","m4a":"assets/audio/music/forest.m4a"}` under music.forest, and matched music.glass-forest; same shape for sounds entries. Record provenance before publication.

Levels use bottom-up tile rows: 0 empty, 1 solid, 2 one-way, 3 ascending slope, 4 breakable, 5 hazard. x is centre, y is feet; one tile = one Three.js unit. Copy an existing JSON, author support surfaces, waves, start/end, checkpoints and secrets. Required paths must pass jump-graph validation. Propose variants on a separate branch with data changes, tests and replay evidence.

## M1 acceptance evidence — v0.1.0

- [x] Local HTTP title, arrows and Space navigation, selection, pause; browser console clean. Explicit `?no-webgl` capability fallback displays a clear message and usable menus.
- [x] `node tests/run.mjs`: physics, guard/parry/stun/reflection, glass mode, levels, deterministic replay, save validation, EN/FR parity, vendor integrity and package checks.
- [x] At tag v0.1.0: Normal Brawler victory in 6,277 simulation frames, 67 credited defeats, one life left. The current tests/replays/normal-brawler.json is regenerated after simulation fixes; How to play → Watch verified replay plays the current recording.
- [x] Attacks start in 4–8 frames and finish within 24. Respawn is 60 simulation frames. First wave triggers at tile 4, one tile from start.
- [ ] End-to-end title-to-first-fight wall-clock timing under 10 seconds has not been instrumented yet.
- [x] Twenty procedural characters: 16 draw calls, 42,592 triangles in the diagnostic scene.
- [x] Foreground Edge measured 59.9 fps with 20 characters over 3,720 frames before later visual polish. The latest halos and landmarks need a fresh measurement; the earlier background 1 fps was not a valid benchmark.
- [x] All wild and boss telegraphs are 20–30 frames; bounds tested.
- [x] EN/FR key parity; French Options rendered and accents checked in browser. UTF-8 validation prevents Windows encoding regressions.
- [x] Legal files/asset brief included; approximately 1.46 MB before real media. Official vendor SHA-256 checked. No external active requests or prohibited runtime APIs in application code.
- [ ] Keyboard navigation exercised; gamepad bindings implemented but no physical controller available. Phone layout inspection belongs to the M3 touch pass.

The 15–25 minute human run target is not verified. The original automated full-information run took 104.6 seconds; see PROGRESS.md for subsequent recordings. Checkboxes intentionally distinguish evidence from implementation. Replays should be shared with their exact Git commit/tag: simulation corrections can change old input logs' outcomes, even when the input format stays compatible.

## M2 — v0.2.0

All three kinds are available. Brawler: six mask points and heavy melee. Skimmer: four, faster movement, three jumps and long glide. Spark: five, permanently glowing palms, cheaper piercing blasts.

Two players → Versus: choose kinds, colours and one of three arenas; two round wins take the match. Clearing has a pit, Canopy has wind, Hollow has bouncing mushrooms. No upgrades in versus.

Two players → Co-op: shared pool of four lives, enemies have 50% more HP. Stay within one screen; the trailing partner is pulled to safe ground. Stand still beside a downed partner for two seconds, with at least one mask point, to revive them at the cost of that point. Both players pick at altars. There is no friendly fire.

P1: WASD, Space, F punch, G sword, H blast, R dodge, T guard. P2: arrows, Up jump, J punch, K sword, L blast, Shift dodge, I guard. Colour and controls are shown before play. Options can remap either layout. One keyboard + one gamepad or two gamepads are supported by the adapter.

M2 tests cover correct teams/HP, all kinds, 120-frame revive and cost, leash, independent upgrades, arena hazards, best-of-three transition and two-player determinism. The French two-player menus and Brawler/Spark Hollow duel were inspected in the browser without console errors. Real simultaneous human keyboard rollover/gamepad tests remain for Charles and Cédric.

## M3

Touch controls appear on touch devices, or can be forced in Options. Move/down on the left zone; double tap that zone to dodge. Four buttons on the right: jump/glide, hit (hold to guard), sword/pogo, orb (hold to charge). Landscape gives the most readable play area. Touch controls operate P1; local multiplayer is intended for keyboard/gamepads.

Open tools/level-editor.html or Options → Level editor. Paint tiles, set markers and place enemies/set pieces. Drag paints; right click erases; arrows/Space/Delete also work. Export JSON to retain a copy. Play this level uses local browser storage and opens a one-level test; its exact custom JSON is included in saved/replay configuration.

New runs use rulesVersion 3, adding Wind Runner (+10% speed), Deep Reserve (+2 energy capacity), Bright Motes (+1 energy per mote). Older recordings retain the original offer pool. For exact historical physics use the recording's original tag, because later bug fixes affect outcomes.

Asset verification: `node tests/run.mjs` parses the two original embedded GLB fixtures with the official GLTFLoader, checks 30 animation clips, independently cloned skin bones, recoloured materials, mask/cracks/shards, named forest meshes and rejected external/compressed resources. `tools/asset-check.html` uses assets/manifest.test.json; browser inspection confirmed one loaded model, 30 clips, loaded forest set, zero pending/failed loads and 9 draw calls. `?assets=test` activates the same fixture manifest in the game. Change the normal assets/manifest.json for delivered art; no gameplay code changes are needed. Do not treat the blocky fixtures as final art.

Post-process bloom is disabled. The baseline reached 59.9 fps; later instanced radial halos need fresh browser verification. No online edition is included: it was explicitly optional, experimental and separate, and this main edition forbids peer connections.

M3 browser QA: 390×844 portrait title/options/gameplay fit without horizontal overflow; four tactile actions and pause remain accessible. 844×390 landscape inspected; camera lowered so the touch pad does not cover the player. Fog distance now follows camera distance, avoiding washed-out characters on narrow screens. The editor was used to place a fern by keyboard and open the custom playable level, with no console errors. Physical multi-touch and phone GPU performance remain unverified.
