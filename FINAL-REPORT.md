# Glasswing — delivery report

Night checkpoint, 29 October 2026. Overnight polish remains active; this report must be refreshed at the morning handover.

## What works

M1, M2 and M3 are implemented and tagged v0.1.0, v0.2.0 and v0.3.0. Main also contains later polish. The game includes all three black four-winged kinds, white masks and glass cannon, melee/sword/blasts, guard/parry/reflection, four forest areas, upgrades, secrets, checkpoints, the three-phase boss, local versus in three arenas, co-op revive/leash, touch controls and a JSON level editor. EN/FR, remapping, saves and input replays are included.

The public repository is https://github.com/codex-lm/glasswing . LOB7 publication is a separate claude.ai step, as specified; it has not been performed.

## How to play

Serve the repository with `python -m http.server 8000` and open http://localhost:8000 . No install or build.

Solo: arrows/WASD move; Space/W/Up jump again in the air and hold to glide; J punch (move or Down + J kicks); K sword (Down + K in air pogos); L blast on release, hold to charge; Shift/I dodge; U/Ctrl guard and tap before impact to parry; Escape/P pause.

Local P1: WASD, Space, F/G/H, R dodge, T guard. P2: arrows, Up, J/K/L, Shift dodge, I guard. Touch is automatic or forced in Options; landscape is clearest. Gamepad mappings are in README.

A broken mask gives triple damage, faster movement and free blasts, but the next hit is fatal. A shard repairs a point. In co-op, stand still beside a downed partner for two seconds to revive them at the cost of one mask point.

## Evidence

`node tests/run.mjs` passes physics, combat, parry/reflection, upgrades, levels, safe spawns/checkpoints, saves, local modes, determinism, GLB fixtures, official vendor hashes, UTF-8, EN/FR parity and package checks. The base package is about 1.65 MB.

Four complete Normal victories are checked into tests/replays and selectable in How to play: Brawler 6,145 frames/3 lives; Skimmer 8,367 frames/2 lives; Spark 9,863 frames/2 lives; Brawler/Spark co-op 6,079 frames/4 lives. These legal inputs come from a full-state-observing bot, not human playtests. The 54-case sweep reaches victory or defeat in every case, without a stalled simulation.

After camera/glow/landmark polish, Edge measured 59.7 fps over 4,560 frames with 20 characters, 19 draw calls and 43,336 triangles, without game console errors. Earlier background-browser measurements were invalid. Phone layouts, editor launch and the real GLB fixture-loading page were inspected in browser; the desktop diagnostic is not phone GPU evidence.

## Missing work and known limitations

- Real Kimi models, Suno music and ElevenLabs recordings are pending. The asset brief, manifests and original GLB fixtures are ready; the default uses procedural art and original oscillator feedback.
- The 15–25-minute human duration target is unverified. Full-information bots finish much faster; no delays were added to inflate duration.
- Physical gamepads, keyboard rollover, actual multi-touch and phone GPU performance remain unverified.
- A fresh safely bound browser session verified radial glow, wind-up poses, four-winged silhouettes, area landmarks and new portrait/landscape touch framing. It caught and fixed an empty-halo shader compile error and inward wings. These halos are not post-process bloom; bloom remains off without demonstrated performance headroom.
- High aerial players and vertically separated partners now fit through rendering-only camera adjustment. Projection tests and a high/low partner browser scene pass; the camera no longer exposes space below the ground row.
- Normal/glass loop synchronisation and sound-node lifecycle now have adapter regression coverage, including reused tracks, late metadata and pause cleanup. Actual listening validation awaits delivered recordings.
- Imported models now preserve hit/parry/telegraph feedback, invincibility blinking, downed-partner visibility and soft shadows. Attack clips follow simulation frames; cloned materials, mixers and GPU skin textures are released on removal. Boss files retain authored tile dimensions. Node regressions and browser fixtures cover these paths; final animation quality still awaits real models.
- Remaining gameplay literals outside data and hot-loop allocations need further audit. The zero-allocation target is not established.
- Share-card file download and title-to-first-fight wall-clock timing still need end-to-end browser verification.
- Replays require their exact commit/tag; later simulation fixes can change old outcomes.
- Bloom and optional separate online fighting are not included.

## What to look at first

Try Brawler on Normal, deliberately break its mask, and parry a projectile. Compare the three silhouettes and Spark palm glow; inspect a high Skimmer jump chain. Then try Canopy versus and co-op revive/leash. Watch the four verified replays, and inspect tools/level-editor.html and tools/asset-check.html.

## Overnight continuation

The active thread heartbeat `glasswing-finition-de-nuit` continues bounded polish every 30 minutes through the morning of 29 October. Each pass must test, log deviations, commit and push. At the first wake at or after 07:30 Europe/Madrid it should finish verification, refresh this report, verify remote Git convergence, pause itself and deliver the morning handover. PROGRESS.md records the completed passes.
