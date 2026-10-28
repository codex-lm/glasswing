# Glasswing

A fast 2.5D forest action game designed by Charles. Four black wings, a white mask, and a glass-cannon comeback. Produced by Cédric Bernadac; implemented by Nilo with Codex.

Serve this directory with `python -m http.server 8000`, then open http://localhost:8000 . No install or build. Run tests with Node 22+ using `node tests/run.mjs`.

Implementation and acceptance evidence are recorded in PROGRESS.md. Publication on LOB7 is performed separately from claude.ai after delivery of a tagged commit.

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
- [x] Full Normal Brawler victory replay in tests/replays/normal-brawler.json: 6,277 simulation frames, 67 credited defeats, one life left. How to play → Watch verified replay plays it in the renderer.
- [x] Attacks start in 4–8 frames and finish within 24. Respawn is 60 simulation frames. First wave triggers at tile 4, one tile from start.
- [ ] End-to-end title-to-first-fight wall-clock timing under 10 seconds has not been instrumented yet.
- [x] Twenty procedural characters: 16 draw calls, 42,592 triangles in the diagnostic scene.
- [ ] Stable 60 fps hardware measurement remains unverified: the embedded browser was throttled while backgrounded (about 1 fps). That is not a valid active-window benchmark.
- [x] All wild and boss telegraphs are 20–30 frames; bounds tested.
- [x] EN/FR key parity; French Options rendered and accents checked in browser. UTF-8 validation prevents Windows encoding regressions.
- [x] Legal files/asset brief included; approximately 1.46 MB before real media. Official vendor SHA-256 checked. No external active requests or prohibited runtime APIs in application code.
- [ ] Keyboard navigation exercised; gamepad bindings implemented but no physical controller available. Phone layout inspection belongs to the M3 touch pass.

The 15–25 minute human run target is not verified. The automated full-information run takes 104.6 seconds; see PROGRESS.md. Checkboxes intentionally distinguish evidence from implementation.

## M2 — v0.2.0

All three kinds are available. Brawler: six mask points and heavy melee. Skimmer: four, faster movement, three jumps and long glide. Spark: five, permanently glowing palms, cheaper piercing blasts.

Two players → Versus: choose kinds, colours and one of three arenas; two round wins take the match. Clearing has a pit, Canopy has wind, Hollow has bouncing mushrooms. No upgrades in versus.

Two players → Co-op: shared pool of four lives, enemies have 50% more HP. Stay within one screen; the trailing partner is pulled to safe ground. Stand still beside a downed partner for two seconds, with at least one mask point, to revive them at the cost of that point. Both players pick at altars. There is no friendly fire.

P1: WASD, Space, F punch, G sword, H blast, R dodge, T guard. P2: arrows, Up jump, J punch, K sword, L blast, Shift dodge, I guard. Colour and controls are shown before play. Options can remap either layout. One keyboard + one gamepad or two gamepads are supported by the adapter.

M2 tests cover correct teams/HP, all kinds, 120-frame revive and cost, leash, independent upgrades, arena hazards, best-of-three transition and two-player determinism. The French two-player menus and Brawler/Spark Hollow duel were inspected in the browser without console errors. Real simultaneous human keyboard rollover/gamepad tests remain for Charles and Cédric.
