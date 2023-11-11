const POWERUP_PARTICLES_STATE = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
}

const POWERUP_PARTICLES_CONFIG = {
  count: 20,
  size: 800,
  speed: 0.4,
  alpha: {
    bottomEdge: 0.2,
    topEdge: 0.4,
  },
  spawnCube: {
    position: { x: 0, y: 0.7, z: 0 },
    size: { x: 0.9, y: 1.2, z: 0.9 },
  },
}

export { POWERUP_PARTICLES_CONFIG, POWERUP_PARTICLES_STATE };
