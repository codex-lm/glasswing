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
