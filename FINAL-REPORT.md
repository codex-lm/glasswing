# Glasswing — delivery report

Morning handover, 29 October 2026. M1–M3 and seventeen polish passes are complete for the available procedural assets. The v0.3.1 checkpoint contains the overnight corrections and this delivery report. The missing media and unverified acceptance items below remain open.

Repository: https://github.com/codex-lm/glasswing . Milestone tags: v0.1.0, v0.2.0 and v0.3.0; verified polish checkpoint: https://github.com/codex-lm/glasswing/tree/v0.3.1 . After handover, the user explicitly authorized Codex to publish on LOB7, overriding the original claude.ai reservation. Publication is pending account recovery; no LOB7 draft or edition has been created in this session.

## What works

- Solo forest run: four areas, three altars, secrets, checkpoints, upgrades and the three-phase Old Glasswing boss. All three kinds have distinct black four-winged silhouettes, white life masks and selectable eye colours. Spark palms glow while idle.
- Combat: punch combos, kicks/dive kicks, sword/pogo, charged palm blasts, dodge cancels, directional guard, perfect parry, stun and reflected projectiles. Broken masks give triple damage, faster movement and free blasts, with one fatal hit remaining.
- Local multiplayer: best-of-three versus in Clearing, Canopy and Hollow; co-op with four shared lives, stronger enemies, independent upgrades, two-second revival and a camera leash.
- Interface: complete EN/FR, keyboard navigation and remapping, gamepad adapters, responsive touch controls, pause, save/resume, JSON save/replay import/export, results and 1200×630 share cards.
- Creation and media: JSON level editor, three extra upgrades, procedural characters/forest, manifest-driven GLB and audio loading, original GLB fixtures and diagnostic pages. Real external media remains pending.

The simulation uses fixed 60 Hz updates, seeded randomness and recorded input masks. Gameplay tuning and frame data live in src/data. Rendering interpolates separately. The static package has no build step, npm dependencies or runtime external requests; official Three.js r128 files remain unmodified and hash-checked.

## How to play

From the repository directory, run `python -m http.server 8000` and open http://localhost:8000 . No install or build is needed. Tests require Node 22+. The optional cache-disabled preview and GLB-generation Python utilities are preserved on dev-assets; LOB7's static package rejects Python files, so main excludes them.

| Action | Solo keyboard |
| --- | --- |
| Move | Arrows or WASD |
| Jump / air jump / glide | Space, W or Up; press again in air, hold to glide |
| Punch / kick | J; move or hold Down for kick |
| Sword / pogo | K; Down + K in air for pogo |
| Palm blast | L, fired on release; hold to charge |
| Dodge | Shift or I |
| Guard / perfect parry | U or Ctrl; tap just before impact |
| Pause | Escape or P |

Local P1: WASD, Space, F attack, G sword, H blast, R dodge, T guard. P2: arrows, Up jump, J attack, K sword, L blast, Shift dodge, I guard. Both layouts can be remapped in Options.

Gamepad: stick/d-pad move; bottom face button jump, left attack, top sword, right blast; right bumper dodge, left bumper guard, Start pause. Menus use up/down for focus, left/right for fields and volume, bottom to confirm, right to go back. One connected pad controls P2 in local multiplayer; two pads map to P1/P2.

Touch: left zone moves/down; double tap it to dodge. Four right buttons provide jump/glide, hit (hold to guard), sword/pogo and orb (hold to charge). Landscape is clearest. Touch controls P1.

In co-op, stand still beside a downed partner for two seconds with at least one mask point; revival costs that point. Skip a shard to remain a glass cannon, or collect it to repair the mask.

How to play offers four verified replays. Options exports/imports saves and opens the level editor. Export editor JSON for a durable copy; Play this level opens a one-level test. Use the recording's exact commit/tag when reporting a replay bug.

## Verification evidence

`node tests/run.mjs` passes simulation, combat, guard/parry/reflection, projectile-pool recycling, level paths/spawns/checkpoints, local modes, deterministic replay, upgrades, imports, editor races, input adapters, UI, audio lifecycle, GLB fixtures, vendor hashes, UTF-8, EN/FR parity and static packaging checks. The package is about 1.75 MB, with 290 checked static module links resolving inside the package. The morning checkpoint had 126 files; the LOB7 packaging correction removes two developer-only Python files without changing gameplay or generated assets.

Four complete Normal victories are checked into tests/replays and re-executed by the suite:

| Recording | Simulation frames | Lives remaining |
| --- | ---: | ---: |
| Brawler | 6,145 | 3 |
| Skimmer | 8,367 | 2 |
| Spark | 9,863 | 2 |
| Brawler + Spark co-op | 6,079 | 4 |

The latest `node tests/sweep.mjs` ran 54 kind/difficulty/seed/mode combinations: 40 victories, 14 defeats, zero unfinished runs and finite player state throughout. These legal-input recordings use a bot with full state visibility. They are regression evidence, not human playtests or proof of the 15–25-minute duration target.

Morning checks also parsed all 81 application/tool/test JavaScript files successfully and reproduced the seven gameplay traces from the verified polish-16 baseline over 37,845 updates. The trace comparison excludes only the audio fields; full-state tracing remains available without `--gameplay`.

Bound localhost browser checks covered the title/selection/pause flows, explicit no-WebGL fallback, EN/FR remapped help, aerial/co-op framing, telegraphs, glow and landmarks, phone-sized layouts, editor export/import/undo and GLB fixtures. Save/export comparisons confirmed pause freezing and replay isolation; the original saved data was restored. Actual PNG exports were inspected for all three solo kinds in English and co-op in French. The latest normal and explicit no-WebGL title smoke had no console errors. Thrown graphics-context requests and hidden-canvas resize recovery have adapter tests.

The valid foreground Edge benchmark from polish 5 measured 59.7 fps over 4,560 frames with 20 procedural characters, 19 draw calls and 43,336 triangles. It was not rerun after later input/audio/startup fixes. This is developer-machine evidence, not proof of five-year-old laptop or phone performance.

GLB tests and the browser fixture page cover 30 clips, independent skinned clones/materials, hit/parry/telegraph feedback, mask parts, authored boss dimensions, frame-driven clips and disposal. Five browser fixture resets stabilized at 9 geometries and 1 skin texture. Audio adapter tests cover normal/glass phase alignment, late metadata, immediate uncached feedback, simultaneous cue retention, sustained loops and cleanup on pause/session transitions. Real-media listening quality is not established by these tests.

## Missing work, risks and known limits

- Kimi models, Suno music and ElevenLabs recordings have not arrived. ASSETS-BRIEF.md specifies names, clips, formats and budgets; assets/manifest.json is the integration point. Record provenance in ASSETS-LICENSE.md before publication. Current sound feedback is original procedural audio; music remains silent.
- Human difficulty and the 15–25-minute run target remain unverified. Automated runs finish much faster. Title-to-first-fight under ten seconds also remains unverified because browser-control timing did not produce a valid live-play sample. No artificial waiting was added to inflate duration.
- Physical gamepad-only play, simultaneous keyboard rollover, real multi-touch and phone GPU performance need device checks. Browser layouts and adapter tests do not substitute for those checks.
- Post-process bloom remains disabled without demonstrated performance headroom. The visible radial halos are separate effects. Optional experimental online fighting is not included.
- Hot-loop array churn was reduced and combat/effect records are reused, but logs, spawns, first-use storage and rendering still allocate. The zero-garbage target has not been established.
- Imported custom levels are checked for valid structure and finite data; arbitrary user-authored levels are not guaranteed reachable or balanced. Editor work requires JSON export for durable copies.
- Replays need their exact source commit/tag. Simulation bug fixes can change historical outcomes even when the input format stays compatible.
- Final model silhouettes, animation quality, music crossfades and sound mixing still need review with the actual delivered media.

## Decisions to review

PROGRESS.md records every deviation and specification ambiguity. In particular: the later checkpoint rule overrides area-start respawning; the fourth fragment grants the deferred bonus choice from the third altar when collected in the Nest, without adding a pre-boss altar; Easy/Hard mask damage is fractional to apply their multipliers; versus converts move damage to mask damage so glass-cannon attacks matter. One pad goes to P2 for keyboard-plus-pad play, and four-button touch shares guard with hit and dodge with a double tap.

## What to look at first

1. Play Brawler on Normal. Deliberately break the mask, repair it with a shard, guard from both sides and parry a projectile. Judge the pace and readability as a human player.
2. Compare all three silhouettes and idle Spark palms; chain high Skimmer jumps. Try Canopy versus, then co-op revive/leash with two people.
3. Watch the four reference replays. Inspect tools/diagnostics.html, tools/asset-check.html and tools/results-check.html, then export and test a level with tools/level-editor.html.
4. Deliver the external media through the manifest, verify provenance, rerun the suite and repeat visual/audio/performance checks before LOB7 publication.

## Morning handover

The overnight engineering work ends with this checkpoint; no further unattended gameplay changes are planned. The delivery sequence is final checks, commit/tag push, remote convergence verification and pausing glasswing-finition-de-nuit. README keeps unverified acceptance items unchecked; PROGRESS.md retains the complete engineering history. The next useful work is human playtesting and integration of the delivered media.
