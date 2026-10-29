// Frames at 60 Hz; speeds and ranges use tiles. These are the existing tuned values.
export const ENEMIES={
 brawler:{hp:6,speed:.035,reach:1.25,telegraph:24,chargeTelegraph:30,active:10,recovery:42,notice:7,chargeSpeed:.16,chargeChance:.25},
 skimmer:{hp:3,speed:.045,reach:5,telegraph:26,chargeTelegraph:28,active:18,recovery:52,notice:9,chargeSpeed:.13,
  hoverHeight:1.3,hoverPhase:17,hoverFrequency:.035,hoverAmplitude:.6,hoverEase:.03,diveMaxSpeed:.12,diveEase:.1,recoverRise:.03},
 spark:{hp:4,speed:.025,reach:8,telegraph:28,chargeTelegraph:28,active:8,recovery:65,notice:10,chargeSpeed:.02,retreatRange:4,approachRange:6}
};
export const WILD={
 spawnY:1,friction:.8,aimHeight:.5,fallY:-4,
 dropMinY:1.3,dropLift:.3,lockBehind:3,lockAhead:9,edgeInset:1,
 pickupHeight:.5,pickupVertical:1,energyPickup:1,shardRepair:1
};
