const EVIL_PUMPKIN_CONFIG = {
  turnRate: 400,
  waitingToRotateTime: { min: 1000, max: 2000 },
  spawnAnimationDuration: 1500,
  maxCount: 5,
  mass: 4,
  halfHeight: 0.5,
  jumpImpulse: 8,
  jumpAnimation: {
    squeezePower: 0.02,
    squeezeDuration: 200,
  },
  speedMultiplier: 1,
}

const EVIL_PUMPKIN_MOVEMENT_STATE = {
  Idle: 'IDLE',
  WaitingToRotate: 'WAITING_TO_ROTATE',
  Rotate: 'ROTATE',
  SqueezeBeforeJumpPhase01: 'SQUEEZE_BEFORE_JUMP_PHASE_01',
  SqueezeBeforeJumpPhase02: 'SQUEEZE_BEFORE_JUMP_PHASE_02',
  GoingUp: 'GOING_UP',
  GoingDown: 'GOING_DOWN',
  SqueezeAfterJumpPhase01: 'SQUEEZE_AFTER_JUMP_PHASE_01',
  SqueezeAfterJumpPhase02: 'SQUEEZE_AFTER_JUMP_PHASE_02',
}

export { EVIL_PUMPKIN_CONFIG, EVIL_PUMPKIN_MOVEMENT_STATE };
