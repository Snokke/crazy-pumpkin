const GHOST_CONFIG = {
  speedMultiplier: 1,
  moveSpeed: { min: 0.7, max: 1.5 },
  turnRate: 300,
  opacity: 0.9,
  spawnAnimationDuration: 1500,
  spawnTime: { min: 1500, max: 2000 },
  lifeTime: { min: 15000, max: 20000 },
}

const GHOST_MOVEMENT_STATE = {
  Idle: 'IDLE',
  Moving: 'MOVING',
  Turning: 'TURNING',
}

export { GHOST_CONFIG, GHOST_MOVEMENT_STATE };
