import { GHOSTS_COLOR_TYPE } from "../../../environment/environment-objects/data/environment-objects-config"

const GHOST_CONFIG = {
  speedMultiplier: 1,
  moveSpeed: { min: 0.7, max: 1 },
  turnRate: 300,
  inclineCoeff: 10,
  activeBodyOpacity: 0.8,
  inactiveBodyOpacity: 0.5,
  spawnAnimationDuration: 1500,
  spawnTime: { min: 1500, max: 2000 },
  lifeTime: { min: 15000, max: 20000 },
  changeColorTime: 400,
}

const GHOST_MOVEMENT_STATE = {
  Idle: 'IDLE',
  Moving: 'MOVING',
  Turning: 'TURNING',
}

const GHOST_COLOR_TYPE = {
  White: 'WHITE',
  Red: 'RED',
  Yellow: 'YELLOW',
  Green: 'GREEN',
}

const GHOST_COLOR_CONFIG = {
  [GHOST_COLOR_TYPE.White]: 0xffffff,
  [GHOST_COLOR_TYPE.Red]: 0xe06969,
  [GHOST_COLOR_TYPE.Yellow]: 0xe1d956,
  [GHOST_COLOR_TYPE.Green]: 0x5add5d,
} 

const GHOSTS_COLOR_BY_TYPE = {
  [GHOSTS_COLOR_TYPE.White]: [GHOST_COLOR_TYPE.White],
  [GHOSTS_COLOR_TYPE.Red]: [GHOST_COLOR_TYPE.Red],
  [GHOSTS_COLOR_TYPE.Yellow]: [GHOST_COLOR_TYPE.Yellow],
  [GHOSTS_COLOR_TYPE.Green]: [GHOST_COLOR_TYPE.Green],
  [GHOSTS_COLOR_TYPE.Random]: [GHOST_COLOR_TYPE.Red, GHOST_COLOR_TYPE.Yellow, GHOST_COLOR_TYPE.Green],
}

export {
  GHOST_CONFIG,
  GHOST_MOVEMENT_STATE,
  GHOST_COLOR_TYPE,
  GHOST_COLOR_CONFIG,
  GHOSTS_COLOR_BY_TYPE,
};
