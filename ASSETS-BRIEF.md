# Glasswing assets — Charles's design

All deliveries are optional: the procedural game stays playable. Paths below are relative to assets/. Update assets/manifest.json to enable a delivery. Never change gameplay collision to follow a mesh. All visible bodies and all FOUR wings are #0B0B0D, masks #F1ECE2, cracks #5C5650. Eye palette: #FF8A3D #3DE8FF #7CFF5E #B57BFF #FF4A4A #FFE24A #FF7AD9 #FFFFFF. Wild eyes #8C8C94; boss turquoise #19B8A6 (not player-selectable).

## 1. Kimi K3.1 — 3D models

Export binary glTF 2.0 (.glb), Blender baked animations at 24 fps, +X forward, +Y up, origin at feet, 1 unit = 1 tile. No Draco, KTX2, meshopt, external URIs, WASM or decoder. Embedded PNG/JPG only. Flat materials, no character textures. Eye/palm materials named `eyes` / `palms`, independently recolourable. Body `body`, mask mesh `mask`, cracks `crack1`, `crack2`, `crack3`, eight shard meshes `shard1` … `shard8`, elite `halfmask`. Four separate wing bones. No lights/cameras required. Keep a friendly cartoon silhouette.

| Files | Budget and shape |
| --- | --- |
| models/brawler.glb | <6,000 triangles; crouched, heavy low arms; 1.4× Skimmer height, 1.8× width; small wings |
| models/skimmer.glb | <6,000 triangles; upright and skinny, FOUR wings longer than body, trailing in run and spread in glide |
| models/spark.glb | <6,000 triangles; thinnest body, normal wings, always-visible emissive palms |
| models/wild-brawler.glb, wild-skimmer.glb, wild-spark.glb | <6,000 each; family silhouettes, grey eyes, optional halfmask |
| models/old-glasswing.glb | <15,000 triangles; three times Brawler size, huge cracked mask, long sword |
| sets/landing.glb, canopy.glb, hollow.glb, nest.glb | <60,000 triangles per set; named modular meshes below |
| sets/arena-clearing.glb, arena-canopy.glb, arena-hollow.glb | one-screen sets, same conventions |
| key/landing.webp | 1920×1080, Glasswing in crater, wings spread; no baked text |

Player clips (exact): idle, run, jump, doublejump, glide, punch1, punch2, punch3, kick, divekick, sword, downsword, blast, charge, dodge, hit, maskbreak, glassidle, beaten. Add block and parry clips if available; otherwise the procedural stance remains. Each delivered attack must fit the frame-data window (not drive it).

Wild clips: idle, move, telegraph, attack, hit, beaten. Boss clips: idle, slam, sweep, barrage, summon, rush, lunge, telegraph, maskbreak, glassidle, beaten. Phase 1 slam/sweep, phase 2 barrage/summon, phase 3 rush/lunge.

Set mesh names: ground-1, ground-2, ground-4, platform, slope, breakable-wall, altar, crater, tree-1, tree-2, fern, root, mushroom, vine, background-1, background-2, background-3. Flat or vertex-coloured materials. Forest palette #A9D68A, #3F7D4F, #CFE9F2, warm yellow; hollow #2A2F4A, emissive mushrooms #79E0C8. No world outlines. Background cards at three depths. Sources .blend on dev-assets only. Expected original model dedication CC0-1.0, confirmed per delivery.

## 2. Suno — music

Five musical families: title (dawn, curious), forest (areas 1–2, light and bouncy), hollow (areas 3–4, mysterious and faster), boss (large and driving), glass cannon (tense stripped variants). To make the fifth family match each context it contains three files, not one incompatible universal loop. No vocals or lyrics. Seamless loops; identical loop duration, BPM and key for each normal/glass pair. OGG Vorbis 128 kbit/s plus AAC .m4a fallback, normalized with headroom, no silent lead-in/out.

Exact bases in audio/music/: title, forest, hollow, boss, glass-forest, glass-hollow, glass-boss. Suggested forest pair 132 BPM D minor; hollow pair 144 BPM E minor; boss pair 152 BPM D minor; title 96 BPM D major. These are delivery suggestions, not claims about undelivered music. Document actual tempo, key and loop length with provenance. Crossfade at the same playback position on mask break/heal.

## 3. ElevenLabs — sound effects

Original cartoon cues, no gore, clear transients. Deliver masters WAV 44.1 kHz (dev-assets), runtime OGG and optional AAC, in audio/sfx/. Names: step1, step2, jump, doublejump, glide-loop, land, punch1, punch2, punch3, kick, divekick, sword-swing, sword-hit, pogo, blast-fire, blast-charge-loop, blast-hit, dodge, player-hit, mask-crack1, mask-crack2, mask-crack3, mask-shatter, glass-loop, shard-pickup, altar-chime, enemy-telegraph, enemy-beaten, boss-roar, round-win, run-win, run-lost, menu-move, menu-select.

Hits 0.08–0.3 s; shatter 0.6 s, roar <1 s, wins <2 s. Seamless loops for glide/charge/glass. Separate sound/music volume; audio unlocked only by user gesture. Record generator, date, account tier and distribution terms in ASSETS-LICENSE.md before publishing.
