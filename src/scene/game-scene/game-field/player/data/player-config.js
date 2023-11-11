const PLAYER_CONFIG = {
  mass: 3,
  halfHeight: 0.3,
  jumpImpulse: 6,
  speedMultiplier: 1,
  invulnerabilityAfterDeathDuration: 4000,
  jumpAnimation: {
    squeezePower: 0.03,
    squeezeDuration: 180,
    disableAnimationBeforeJumpThreshold: 0.5,
  },
  idleAnimation: {
    squeezePower: 0.85,
    squeezeDuration: 320,
  },
  spawnAnimation: {
    desktop: {
      positionY: 8,
      duration: 400,
    },
    mobile: {
      positionY: 11.5,
      duration: 700,
    },
  },
}

export { PLAYER_CONFIG };
