import { DIRECTION } from "../../data/game-data"

const PLAYER_STATE = {
  Idle: 'IDLE',
  Jump: 'JUMP',
  DeathAnimation: 'DEATH_ANIMATION',
}

const PLAYER_JUMP_STATE = {
  None: 'NONE',
  SqueezeBeforeJumpPhase01: 'SQUEEZE_BEFORE_JUMP_PHASE_01',
  SqueezeBeforeJumpPhase02: 'SQUEEZE_BEFORE_JUMP_PHASE_02',
  GoingUp: 'GOING_UP',
  GoingDown: 'GOING_DOWN',
  SqueezeAfterJump: 'SQUEEZE_AFTER_JUMP',
}

const PLAYER_ACTIONS = {
  JumpLeft: 'JUMP_LEFT',
  JumpRight: 'JUMP_RIGHT',
  JumpUp: 'JUMP_UP',
  JumpDown: 'JUMP_DOWN',
  JumpInPlace: 'JUMP_IN_PLACE',
  JumpInPlaceRotateLeft: 'JUMP_IN_PLACE_ROTATE_LEFT',
  JumpInPlaceRotateRight: 'JUMP_IN_PLACE_ROTATE_RIGHT',
  JumpInPlaceRotateUp: 'JUMP_IN_PLACE_ROTATE_UP',
  JumpInPlaceRotateDown: 'JUMP_IN_PLACE_ROTATE_DOWN',
}

const PLAYER_CONVERT_JUMP_IN_PLACE = {
  [PLAYER_ACTIONS.JumpLeft]: PLAYER_ACTIONS.JumpInPlaceRotateLeft,
  [PLAYER_ACTIONS.JumpRight]: PLAYER_ACTIONS.JumpInPlaceRotateRight,
  [PLAYER_ACTIONS.JumpUp]: PLAYER_ACTIONS.JumpInPlaceRotateUp,
  [PLAYER_ACTIONS.JumpDown]: PLAYER_ACTIONS.JumpInPlaceRotateDown,
}

const PLAYER_ACTION_TO_DIRECTION = {
  [PLAYER_ACTIONS.JumpLeft]: DIRECTION.Left,
  [PLAYER_ACTIONS.JumpRight]: DIRECTION.Right,
  [PLAYER_ACTIONS.JumpUp]: DIRECTION.Up,
  [PLAYER_ACTIONS.JumpDown]: DIRECTION.Down,
  [PLAYER_ACTIONS.JumpInPlace]: null,
}

export {
  PLAYER_STATE,
  PLAYER_JUMP_STATE,
  PLAYER_ACTIONS,
  PLAYER_ACTION_TO_DIRECTION,
  PLAYER_CONVERT_JUMP_IN_PLACE,
};
