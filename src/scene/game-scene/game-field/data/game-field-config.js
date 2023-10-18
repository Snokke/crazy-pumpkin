const GAME_FIELD_CONFIG = {
  cellSize: 1,
  gravity: 9.8,
  helpers: false,
  currentLevel: null,
}

const DIRECTION = {
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT',
}

const GAME_OBJECT_TYPE = {
  Player: 'PLAYER',
  Enemy: 'ENEMY',
  Obstacle: 'OBSTACLE',
}

const GAME_STATE_TYPE = {
  Idle: 'IDLE',
  Active: 'ACTIVE',
  GameOver: 'GAME_OVER',
}

export { GAME_FIELD_CONFIG, DIRECTION, GAME_OBJECT_TYPE, GAME_STATE_TYPE };
