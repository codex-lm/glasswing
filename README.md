# Glasswing

A fast 2.5D forest action game designed by Charles. Four black wings, a white mask, and a glass-cannon comeback. Produced by Cédric Bernadac; implemented by Nilo with Codex.

Serve this directory with `python -m http.server 8000`, then open http://localhost:8000 . No install or build. Run tests with Node 22+ using `node tests/run.mjs`.

For frequent local edits, `python tools/serve.py --port 8000` offers the same static preview with cache disabled. Stop any server already using that port first. No preview server is needed on LOB7.

The current delivery checkpoint and remaining work are in FINAL-REPORT.md. Implementation and acceptance evidence are recorded in PROGRESS.md. Publication on LOB7 is performed separately from claude.ai after delivery of a tagged commit.

## Play

Solo: arrows or WASD to move; Space / W / Up to jump, again for a double jump, hold to glide. J punches, moving + J or Down + J kicks. K swings the needle-sword; Down + K in the air pogos. L fires on release; hold to charge. Shift / I dodges. U / Ctrl guards; tap just before a hit for a perfect parry. Escape / P pauses. Every key can be remapped in Options.

Your white mask is your life. At zero points it shatters: damage ×3, movement +20%, free blasts, but the next hit is fatal. A shard repairs one point. Three lives; checkpoints every 20 tiles. Three altars offer upgrades with one action. Four fragments unlock one extra choice in the Nest. Defeat the Old Glasswing after its final broken-mask rush.

Gamepad: left stick/d-pad; bottom face button jump, left attack, top sword, right blast, right bumper dodge, left bumper guard, Start pause. In menus, up/down moves focus, left/right adjusts selectors and volume, the bottom button confirms or advances to the next field, and the right button goes back. Start toggles once per press. One pad in two-player mode is P2; two pads map P1/P2. Physical pad testing is still needed.

## Structure and media

`src/core/` is DOM-free simulation apart from the input adapter; `src/game/` holds run flow and AI, `src/data/` holds tuning/frame data and level JSON. `src/render/` uses unmodified vendored Three.js r128 in its official directory structure. `src/ui/` provides screens, localization, saves, asset/audio adapters. No build step, network service, or package.json.

See ASSETS-BRIEF.md for exact model, clip, music and cue names. Add embedded uncompressed GLBs under assets/models and map `"brawler":"assets/models/brawler.glb"` in assets/manifest.json. Missing entries keep the procedural model. Maps reject external resource URIs and compressed models. No external music or recordings are delivered yet; short original oscillator sounds provide feedback. Music and sound sliders are independent. Add `{"ogg":"assets/audio/music/forest.ogg","m4a":"assets/audio/music/forest.m4a"}` under music.forest, and matched music.glass-forest; same shape for sounds entries. Record provenance before publication.

Levels use bottom-up tile rows: 0 empty, 1 solid, 2 one-way, 3 ascending slope, 4 breakable, 5 hazard. x is centre, y is feet; one tile = one Three.js unit. Copy an existing JSON, author support surfaces, waves, start/end, checkpoints and secrets. Required paths must pass jump-graph validation. Propose variants on a separate branch with data changes, tests and replay evidence.

## M1 acceptance evidence — v0.1.0

- [x] Local HTTP title, arrows and Space navigation, selection, pause; browser console clean. Explicit `?no-webgl` capability fallback displays a clear message and usable menus.
- [x] `node tests/run.mjs`: physics, guard/parry/stun/reflection, glass mode, levels, deterministic replay, save validation, EN/FR parity, vendor integrity and package checks.
- [x] At tag v0.1.0: Normal Brawler victory in 6,277 simulation frames, 67 credited defeats, one life left. The current tests/replays/normal-brawler.json is regenerated after simulation fixes; How to play → Watch verified replay plays the current recording.
- [x] Attacks start in 4–8 frames and finish within 24. Respawn is 60 simulation frames. First wave triggers at tile 4, one tile from start.
- [ ] End-to-end title-to-first-fight wall-clock timing under 10 seconds remains unverified: browser-control timing did not produce a valid live-play sample.
- [x] Twenty procedural characters after visual polish: 19 draw calls, 43,336 triangles in the diagnostic scene.
- [x] Edge measured 59.7 fps with 20 characters over 4,560 frames after camera/halo/landmark polish. The earlier background 1 fps was not a valid benchmark.
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

Asset verification: `node tests/run.mjs` parses the three original embedded GLB fixtures (character, authored-size boss and forest) with the official GLTFLoader, checks 30 animation clips, independently cloned skin bones, recoloured materials, mask/cracks/shards, named forest meshes and rejected external/compressed resources. `tools/asset-check.html` uses assets/manifest.test.json; browser inspection confirmed one loaded model, 30 clips, loaded forest set, zero pending/failed loads and 10 draw calls including the soft shadow. The diagnostic now offers hit/glass/telegraph/downed/boss poses and repeated level resets; five resets stabilized at 9 geometries and 1 skin texture. Tests also cover hit/parry colours, frame-driven attack clips, downed-partner visibility, baked skin dimensions and instance disposal without invalidating shared geometry. `?assets=test` activates the same fixture manifest in the game. Change the normal assets/manifest.json for delivered art; no gameplay code changes are needed. Do not treat the blocky fixtures as final art.

Post-process bloom is disabled without demonstrated headroom. Instanced radial halos passed browser inspection, with the enriched diagnostic scene measuring 59.7 fps. No online edition is included: it was explicitly optional, experimental and separate, and this main edition forbids peer connections.

M3 browser QA: 390×844 portrait title/options/gameplay fit without horizontal overflow; four tactile actions and pause remain accessible. 844×390 landscape inspected; camera lowered so the touch pad does not cover the player. Fog distance now follows camera distance, avoiding washed-out characters on narrow screens. The editor was used to place a fern by keyboard and open the custom playable level, with no console errors. Physical multi-touch and phone GPU performance remain unverified.

Later camera polish reserves 170 pixels beneath the touch canvas, zooms portrait play for readable characters, and fits aerial/co-op players while keeping the ground bound. The compact landscape HUD leaves the player visible. `tools/diagnostics.html?pose=air&area=nest` shows a high/low partner case; `pose=glass&area=hollow` and `pose=windup&area=canopy` inspect glow and anticipation. These are controlled visual fixtures, not playthroughs.

Input and persistence regression coverage includes sparse one/two-pad mappings, stick drift, held Start, short keyboard taps, control focus, sliders, abandoned key remapping, fresh-run saves and replay isolation. Browser exports proved a paused replay stayed at the exact 294-frame reference prefix and a saved 557-frame run survived replay viewing plus title reload unchanged. The pre-test local save was restored exactly. These checks do not replace physical gamepad testing.

Result cards preserve each kind's four-winged proportions, eye colour, mask cracks/glass state and both co-op players' upgrades. `tools/results-check.html` reconstructs the four checked victories and exercises the real result/export modules without changing saves. Actual browser downloads were inspected for all three solo kinds in English and Brawler/Spark co-op in French: valid 1200×630 PNGs, bundled fonts, readable statistics and complete upgrade names. This verifies export output, not human playthrough pacing.

Simulation tuning is grouped under `src/data/`: feel/physics, move rectangles, kinds, enemy flight/spacing, boss patterns, run/versus flow and upgrade values. Run flow, enemy AI, co-op, versus and camera code now use explicit ordered loops instead of temporary entity lists. `node tests/trace.mjs` prints a SHA-256 digest over every dynamic simulation state for the four recorded runs and three duel scenarios; compare its output before/after refactors. The first audit preserved all seven digests across 37,845 updates. Allocations remain in combat event setup, input logs and rendering; zero garbage per frame is not claimed.

The subsequent projectile-pool fix makes boss slams/barrages configure the orb just spawned, even when an earlier slot is reused while a later player orb is still alive. A full pool leaves energy and existing shots intact. Hit lists, impact rectangles/options and particle records are reused. All four recordings still win at the same frame/life totals; Spark/co-op intermediate traces change where the corrected boss shots occur. The post-fix 54-case sweep completes with 40 wins and 14 defeats, without stalls.

Help and tutorial prompts use the saved solo/P1/P2 bindings in both languages. Modifier aliases have readable localized names. The HUD labels each co-op player, exposes energy as an accessible meter and preserves unchanged DOM nodes. Controlled UI tests cover remapped keys, upgrade values and HUD reuse.

Imported saves/replays validate playable configuration and custom level structure before replacing current play. Invalid optional best records are discarded; unavailable local storage remains nonfatal. Editor levels named `arena-*` can run solo and survive replay restoration. Structural validation does not establish reachability or difficulty of user-authored levels.

The editor ignores input until a level is available. Painting or undo cancels an older pending load; invalid imports retain the open document. Export JSON for durable copies. Regression tests exercise racing loads and undo; browser exports verified that an invalid import preserved the exact edited level.

Touch adapter regressions cover two-finger ownership, simultaneous independent controls, true double taps, guard timer cancellation, blur/hidden/menu cleanup and brief blast input. Physical phone multi-touch remains unverified.

An uncached effect gives immediate procedural feedback while its recording decodes for the next event. Late decoding never replays old hits after pause. Session boundaries stop active effects/loops and release their nodes; controlled audio tests cover this lifecycle. Listening validation still awaits the delivered media.

Sound events now preserve mask/parry warnings alongside impacts, with a reused eight-cue frame buffer and per-frame deduplication. Steps, missed swings, pogo, blast impacts, mask severity, menus and custom-level wins are connected; delivery keys live in `src/data/audio.js`. `node tests/trace.mjs --gameplay` excludes only audio fields: seven traces matched across 37,845 updates after this presentation change. Full traces still include audio by default.
