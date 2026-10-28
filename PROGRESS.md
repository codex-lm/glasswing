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
