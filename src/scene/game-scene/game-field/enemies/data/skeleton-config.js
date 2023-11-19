const SKELETON_CONFIG = {
  speedMultiplier: 1,
  moveSpeed: 0.7,
  runAnimationTransitionMultiplier: 1.9,
  chanceToChangeDirection: 0.17,
  turnRate: 300,
  spawnAnimationDuration: 1500,
  spawnTime: { min: 1500, max: 2000 },
  lifeTime: { min: 15000, max: 20000 },
}

const SKELETON_MOVEMENT_STATE = {
  Idle: 'IDLE',
  Moving: 'MOVING',
  Turning: 'TURNING',
}

export { SKELETON_CONFIG, SKELETON_MOVEMENT_STATE };
