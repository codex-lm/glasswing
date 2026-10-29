// Explicit module-relative URLs keep the package self-contained at any host path.
export const LEVEL_FILES=Object.freeze({
 landing:new URL('./levels/landing.json',import.meta.url),
 canopy:new URL('./levels/canopy.json',import.meta.url),
 hollow:new URL('./levels/hollow.json',import.meta.url),
 nest:new URL('./levels/nest.json',import.meta.url),
 'arena-clearing':new URL('./levels/arenas/clearing.json',import.meta.url),
 'arena-canopy':new URL('./levels/arenas/canopy.json',import.meta.url),
 'arena-hollow':new URL('./levels/arenas/hollow.json',import.meta.url)
});
export const REPLAY_FILES=Object.freeze({
 'normal-brawler':new URL('../../tests/replays/normal-brawler.json',import.meta.url),
 'normal-skimmer':new URL('../../tests/replays/normal-skimmer.json',import.meta.url),
 'normal-spark':new URL('../../tests/replays/normal-spark.json',import.meta.url),
 'coop-brawler-spark':new URL('../../tests/replays/coop-brawler-spark.json',import.meta.url)
});
