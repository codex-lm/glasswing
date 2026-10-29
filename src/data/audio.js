export const SOUND_CUES=[
 'step1','step2','jump','doublejump','glide-loop','land','punch1','punch2','punch3',
 'kick','divekick','sword-swing','sword-hit','pogo','blast-fire','blast-charge-loop',
 'blast-hit','dodge','player-hit','mask-crack1','mask-crack2','mask-crack3','mask-shatter',
 'glass-loop','shard-pickup','altar-chime','enemy-telegraph','enemy-beaten','boss-roar',
 'round-win','run-win','run-lost','menu-move','menu-select','block','parry'
];
export const AUDIO={
 fade:.5,loopVolume:.3,silence:.001,duration:.09,base:220,volume:.14,
 // Cosmetic cadence uses simulation frames; priority keeps crowded fights readable.
 maxCues:8,stepFrames:16,stepSpeed:.02,maskCracks:3,
 priority:{step1:0,step2:0,'menu-move':1,'sword-swing':2,'blast-fire':3,
  'player-hit':6,'boss-roar':7,'mask-shatter':9,parry:8,'run-win':10,'run-lost':10,'round-win':10},
 tones:{
  step1:85,step2:100,jump:520,doublejump:740,land:100,dodge:330,
  'mask-shatter':105,'mask-crack1':950,'mask-crack2':1050,'mask-crack3':1150,
  'sword-swing':760,'sword-hit':650,pogo:880,parry:1100,block:180,
  'blast-fire':440,'blast-hit':480,'player-hit':150,'enemy-beaten':290,
  'shard-pickup':900,'altar-chime':780,'run-win':1200,'run-lost':130,
  'round-win':1000,'enemy-telegraph':350,'boss-roar':70,
  kick:140,divekick:120,punch1:180,punch2:210,punch3:120,'menu-move':440,'menu-select':660
 }
};
