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
