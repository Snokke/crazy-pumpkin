const GHOST_CONFIG = {
  moveSpeed: { min: 0.5, max: 1.5 },
  turnRate: 300,
  opacity: 0.9,
  spawnAnimationDuration: 1700,
  spawnTime: { min: 1000, max: 4000 },
  lifeTime: { min: 20000, max: 25000 },
  maxCount: 20,
}

const GHOST_MOVEMENT_STATE = {
  Idle: 'IDLE',
  Moving: 'MOVING',
  Turning: 'TURNING',
}

export { GHOST_CONFIG, GHOST_MOVEMENT_STATE };
