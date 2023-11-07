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
  Consumable: 'CONSUMABLE',
}

const GAME_STATE = {
  Idle: 'IDLE',
  Gameplay: 'GAMEPLAY',
  GameOver: 'GAME_OVER',
}

const MAP_TYPE = {
  Consumable: 'CONSUMABLE',
  Obstacle: 'OBSTACLE',
  Ghost: 'GHOST',
  EvilPumpkin: 'EVIL_PUMPKIN',
  Skeleton: 'SKELETON',
}

const ROTATION_BY_DIRECTION = {
  [DIRECTION.Down]: 0,
  [DIRECTION.Right]: Math.PI / 2,
  [DIRECTION.Up]: Math.PI,
  [DIRECTION.Left]: Math.PI * 1.5,
}

export {
  GAME_OBJECT_TYPE,
  DIRECTION,
  GAME_STATE,
  ROTATION_BY_DIRECTION,
  MAP_TYPE,
};
