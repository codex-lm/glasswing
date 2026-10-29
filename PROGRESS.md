# Glasswing — overnight engineering log, 29 October 2026

Authority: SPEC-glasswing.md read in full, SPEC-jump1.md §3 packaging read. Specifications are private local input, ignored by git. Work performed solo as requested. Public repository: https://github.com/codex-lm/glasswing . Publication is a separate claude.ai action (§8), not part of a push.

## M1.1 — skeleton and legal files
Done: public main repository initialized; static shell, local OFL fonts, official unmodified Three.js r128/GLTFLoader/SkeletonUtils, MIT and media notices, manifest, three-part asset brief, EN/FR and dependency-free tests.
Deviations: official vendor subdirectories replace the suggested flat file names, preserving relative imports without modifying upstream files. No rights or credits claimed for undelivered media. Conflicts resolved: §5 checkpoints override §2 area-start respawn; fourth fragment grants the deferred second selection of the third altar, with no new pre-boss altar. Five music families require three matched glass variants. Existing unsigned/undelivered assets stay silent.
Next: M1.2 deterministic simulation, input, physics and camera.

### M1.1 dependency delivery correction
Done: downloaded all official files, verified SHA-256, converted Google-served TTF to local WOFF2, added dependency integrity tests.
Deviations: the initial download aborted because Google returned TTF. The first commit's dependency-presence claim was premature; this immediate follow-up supplies the actual files and strengthens the test. No history rewritten.
Next: M1.2 core, with command failure checked before committing.

## M1.2 — deterministic core
Done: seeded RNG, frame-based entity state, two keyboard layouts and gamepads, movement, variable jumps, glide, coyote/buffer, substepped grid collision including one-way/slopes, midpoint camera; physics tests pass.
Deviations: data files live in src/data as in §7's tree; one gamepad in local two-player mode goes to P2 so keyboard P1 + pad P2 works; two pads map in connection order. Deterministic fixed-frame input masks will be the replay format.
Next: M1.3 Three.js scene, pooled procedural silhouettes, forest and safe model adapter.

## M1.3 — procedural 3D rendering
Done: perspective Three.js scene, warm/cool lighting, layered instanced forest, four-wing silhouettes and readable masks/cracks, primitive poses, interpolated test movement, pooled visual instances, safe embedded-GLB adapter with clips/material recolouring.
Deviations: modern capsule primitive is unavailable in pinned r128; stretched low-poly spheres form capsule-like bodies. Instancing across characters keeps the 20-character draw budget feasible. Model loading retains placeholders on failure; unsupported compression and external model URIs are rejected before parsing.
Next: M1.4 frame-data combat and title/menu smoke test, then actual browser verification.

## M1.4 — combat and title
Done: frame-data punches/combo, moving/down kick, divekick, sword/pogo, charged blast, energy, dodge and block cancels, exact parry windows/reflection/stun, mask shatter and glass cannon; localized title, selection, pause and HUD. Browser test scene rendered with no console errors.
Deviations: mask damage is fractional on Easy/Hard to honor their damage multipliers; cracks and displayed mask points round upward. Versus damage will normalize move damage by 3 so glass damage can meaningfully triple mask damage. Missing-model audio remains silent. Desktop/phone framing needs a later visual pass.
Next: M1.5 three telegraphed enemy types, elites, waves and seeded drops.

## M1.5 — wild Glasswings
Done: ground Brawlers with charge, looping/diving Skimmers, retreating ranged Sparks, two-hit elite half masks, 24–30 frame telegraphs, staggered waves/locks and seeded one-in-six shards plus energy drops. Telegraph bounds tested.
Deviations: enemy charge selection consumes the run RNG, decorative movement does not. Drops currently collect on contact; the player can jump over shards to preserve glass mode. No unavoidable contact damage outside a telegraphed attack.
Next: M1.6 four authored levels, checkpoints, upgrades, secrets, boss, run results and share card.

## M1.6 — full forest structure
Done: four 60-tile level files, six waves per area, gaps/platforms/breakable walls, 20-tile checkpoints, three altars, all 13 specified upgrades, hidden mask/fragment in each area, 24-HP three-phase boss, one-second respawn, win/loss stats and 1200×630 share card; seed/input replay and level reachability tests pass.
Deviations: the fourth fragment opens the deferred third-altar bonus immediately when found in the Nest, resolving the impossible original order without inserting a fourth altar. Boss phase 3 contact danger begins after the mask-break invincibility warning. The first automated full-run attempt is the next step; duration and difficulty are not yet certified.
Next: M1.7 legal-input playthrough, replay capture and tuning; visual framing/performance measurements.

## M1.7 — first feel and replay pass
Done: legal-input bot completed all four areas and boss on Normal Brawler, 6,277 fixed frames, 67 credited defeats, one life left, winning in glass mode. Exact seed/input recording checked in and re-executed in tests. Fixed bot air control over gaps; adjusted camera to retain 18 visible tiles on narrow windows and opened the four-wing poses.
Deviations: automated perfect-information run takes 104.6 s, much shorter than the 15–25 minute design target. That target is NOT verified for a first-time human player; no artificial waiting or inflated enemy HP added to claim compliance. Tutorial/readability and exploratory human duration remain a tuning risk. No hardware gamepad has been physically exercised.
Next: M1.8 options/remapping, save/replay import/export, audio manifest, acceptance evidence and v0.1.0; continue directly to M2.

## M1.8 — options, saves and release checkpoint
Done: EN/FR options with full keyboard remapping/live key display, difficulty/seed/eye selection, saved settings/run replay, resume after refresh, JSON import/export validation, result bests, reference replay playback, local audio/music adapters and original short sound placeholders. Browser checked French accents, keyboard smoke and explicit no-WebGL fallback. Package 1.46 MB; 20-character diagnostic reports 16 draw calls and 42,592 triangles. Tests green; v0.1.0 checkpoint tagged.
Deviations: no physical gamepad or valid foreground 60 fps measurement yet; embedded background tab was throttled. README leaves these checks open, and records the short automated run duration. Fonts source format conversion and Windows UTF-8 corrections are documented/tested. Model/music delivery still pending. No LOB7 publication claimed: spec assigns that to claude.ai.
Next: M2.1 enable Skimmer/Spark selection, versus arenas and best-of-three rounds, then co-op/revive/leash; do not stop at M1.

## M2.1 — kinds and local multiplayer
Done: all three kinds selectable with correct mask/speed/jump/glide/damage values and distinct silhouettes; two independent eye selections; three versus arenas (pit, wind, bouncing mushrooms), best-of-three rounds; co-op shared four lives, +50% enemy/boss HP, 120-frame revive costing one mask point, safe leash and each player's own altar choice. Tests verify those transitions and preserve the M1 victory replay.
Deviations: identical selected eye colours are automatically separated for readability. A co-op player who falls is placed curled up on the next safe ground so the partner can actually revive them. Versus uses Normal mask counts regardless of solo difficulty. Local modes only, as mandated; no networking included.
Next: M2.2 browser verification and two-player control/readability pass, then v0.2.0 and M3 touch/editor/assets.

## M2.2 — local-mode validation
Done: French two-player menus, independent kind/eye selectors, arena choice and live Brawler-versus-Spark Hollow scene inspected without console errors; two HUDs use eye colours and correct masks/round score. Added 1,800-frame deterministic tests for versus and co-op. M1 reference still wins unchanged. v0.2.0 tagged.
Deviations: the in-app browser is throttled outside tool activity and Chrome automation is unavailable, so physical simultaneous-input and foreground FPS claims remain explicitly unverified. No bloom will be enabled without a valid 60 fps measurement. The game remains local-only.
Next: M3.1 touch controls and responsive layout; then level editor, extra upgrades and dummy-GLB integration proof.

## M3.1 — touch input
Done: four right-hand touch buttons, left movement/down zone, double-tap dodge, hold-to-guard melee button, pause, safe-area layout, input pulses for short taps, pointer capture/cancellation, automatic or forced touch setting, complete EN/FR gesture hints. The same bit masks enter the deterministic replay log.
Deviations: with only four action buttons, guard shares the melee button (100 ms hold) and dodge uses a double tap on the left pad; this preserves all moves without adding six right-hand buttons. Touch currently drives P1; local two-player remains keyboard/gamepad as specified.
Next: M3.2 in-browser collision/set-piece editor with JSON import/export and playable test level.

## M3.2 — level editor
Done: standalone bilingual editor loads the four authored areas, paints all collision types, places named set pieces/enemies/checkpoints/start/exit/secrets, supports keyboard painting and undo, validates bounded JSON imports, exports JSON and opens a playable local test. Custom-level data travels inside replay configuration so its input log remains reproducible.
Deviations: a custom level is a one-level test run; exporting its JSON is the explicit durable delivery path. Editor playback uses same-origin browser storage when available, with a clear error and export alternative otherwise. Automatic path repair is intentionally absent; authors can create challenge or unreachable layouts and must playtest them.
Next: M3.3 extra upgrades with replay-version preservation, model/set manifest integration and dummy GLB tests.

## M3.3 — media path and extra upgrades
Done: three additional upgrades, versioned offer pools preserving old replays, local GLB character and named-set replacement through manifest, independent skinned clones/materials, 30-clip lookup, model mask/crack/shard control, instanced set placement. Original tiny GLB fixtures and regeneration script checked in. Node tests and real browser fixture page pass: 1 model, 30 clips, loaded landing set, zero failures, 9 draw calls.
Deviations: fixtures are MIT engineering blocks, explicitly not Kimi deliverables; default manifest stays on procedural art. Bloom omitted because no trustworthy 60 fps foreground measurement is available. Music/SFX adapters accept local OGG/AAC; actual generated deliveries and provenance remain pending. No optional experimental online edition on main.
Next: M3.4 mobile/editor browser QA, remaining regression fixes, tag v0.3.0; then sustained gameplay/readability polish.

## M3.4 — mobile/editor verification
Done: inspected 390×844 portrait and 844×390 landscape, all four tactile actions and pause visible; fixed camera-dependent fog that washed out portrait characters and lowered landscape framing above touch controls. Replaced keyboard hints in touch play. Editor keyboard placement and custom-level launch verified in the real browser, no console errors. All regression tests pass; v0.3.0 checkpoint tagged.
Deviations: touch actions are implemented but physical multi-touch/phone GPU performance still need device validation. Bloom stays off. Full human pacing target and hardware-controller checks remain open, not silently checked off. Real media is still pending external delivery.
Next: polish passes on simulation edge cases, combat readability, effects, menus, difficulty and broader legal-input runs; write FINAL-REPORT.md after the remaining work.

## Polish 1 — combat fairness and physics edge cases
Done: fixed projectile kills crediting a temporary object instead of the shooter, preserved exact half-tile knockback through movement updates, repaired ascending slope contact, made simultaneous versus attacks trade instead of favouring P1, blocked orbs on solid terrain, and added a readable boss mask-break warning. Regression tests cover owner credit, slope/knockback and double knockout. Re-recorded legal-input Normal Brawler victory: 6,145 frames (102.4 s), 61 credited defeats, all three lives left.
Deviations: simulation fixes change historical input outcomes; exact old recordings remain available at their original tags. README now states this clearly. A 12-minute bot result was rejected as pacing evidence because it spent ten minutes above a platform target; the bot now drops through platforms and reacts to projectiles. No waiting was added to inflate run length.
Next: broader seed/kind/mode playthroughs and visual pass for area identity, readable telegraphs, impact effects and menus; native Edge performance test is now available.

## Polish 2 — readable silhouettes and area identity
Done: added visible wind-up/guard/curl poses, one crack branch per lost mask point, blazing glass-mode eyes, stronger Spark palm halos, a larger title mascot, a crater/Canopy branches/Nest roots and shards; real-model movement now interpolates and animation freezes during pause/hit stop. The foreground Edge benchmark reached 59.9 fps over 3,720 frames before these additions. All simulation/package/asset tests pass.
Deviations: the new glow is an instanced radial halo, not post-process bloom. Computer Use stopped because it could not confirm the Windows browser URL; visual verification and a new performance measurement for this commit remain pending. No browser bypass was attempted.
Next: broaden legal-input coverage, inspect failed runs and improve simulation/data contracts, then resume visual QA when browser control is available.

## Polish 3 — full-run coverage and persistence
Done: ran 54 legal-input combinations (3 kinds × 3 difficulties × 3 seeds × solo/co-op); all reached a result without a stuck simulation. Corrected one ground Brawler spawn over a Canopy gap and added safe-spawn/checkpoint tests. Added verified Normal Skimmer, Spark and co-op recordings to How to play and the regression suite. Personal bests now retain better results, page exit saves the current input log, menu focus tracks the actual control, and model loading waits for play. Jump/landing/dodge now emit short feedback and pooled dust.
Deviations: bot defeats remain defeats; these recordings use full-state observation and are not human difficulty or duration evidence. Cosmetic additions and updated menus await browser inspection after the Computer Use interruption. Real gamepad and multi-touch devices are still unavailable.
Next: inspect glow/telegraphs in browser, remeasure FPS, test high aerial camera framing and audio loop synchronisation; consolidate gameplay tuning into data and audit asset lifecycle. Continue overnight polish before the final handover.

## Overnight checkpoint and continuation
Done: wrote the delivery checkpoint in FINAL-REPORT.md, refreshed README evidence, and created the thread heartbeat glasswing-finition-de-nuit to continue bounded polish every 30 minutes through the morning. M1–M3 tags remain intact; all four victory replays pass.
Deviations: remaining hardware, visual, media and human-pacing checks are not finished. Computer Use is unavailable in this turn after URL verification failed. The final morning report is scheduled after 07:30 Europe/Madrid.
Next: continue the documented polish priorities, then final tests, remote convergence, morning report and heartbeat shutdown.
