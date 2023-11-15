import { ENVIRONMENT_OBJECTS_TYPE } from "./environment-objects-type";

const ENVIRONMENT_OBJECT_STATE = {
  Idle: 'Idle',
  IdleAnimation: 'IdleAnimation',
  Interaction: 'Interaction',
}

const GHOSTS_COLOR_TYPE = {
  White: 'WHITE',
  Red: 'RED',
  Yellow: 'YELLOW',
  Green: 'GREEN',
  Random: 'RANDOM',
}

const GHOSTS_COLOR_QUEUE = [
  GHOSTS_COLOR_TYPE.White,
  GHOSTS_COLOR_TYPE.Red,
  GHOSTS_COLOR_TYPE.Yellow,
  GHOSTS_COLOR_TYPE.Green,
  GHOSTS_COLOR_TYPE.Random,
]

const ENVIRONMENT_OBJECTS_CONFIG = {
  [ENVIRONMENT_OBJECTS_TYPE.Pumpkin]: {
    idleAnimationTime: { min: 8000, max: 12000 },
    viewScale: 0.5,
    squeezeDuration: 200,
    interactionSqueezePower: 0.75,
    idleSqueezePower: 0.9,
  },
  [ENVIRONMENT_OBJECTS_TYPE.Scarecrow]: {
    idleAnimationTime: { min: 10000, max: 15000 },
    idleImpulse: { min: 2, max: 4 },
    idleSpeedDecrease: 2,
    interactionImpulse: 7,
    interactionSpeedDecrease: 3,
    maxSpeed: 50,
  },
  [ENVIRONMENT_OBJECTS_TYPE.PostSkullLeft]: {
    idleAnimationTime: { min: 12000, max: 16000 },
    position: { x: 0, y: 0, z: 0 },
    gravity: 5,
    mass: 50,
    length: 500,
    maxAngle: 120 * Math.PI / 180,
    interactionImpulse: 0.05,
    idleImpulse: { min: 0.005, max: 0.02 },
  },
  [ENVIRONMENT_OBJECTS_TYPE.PostSkullRight]: {
    idleAnimationTime: { min: 15000, max: 20000 },
    position: { x: 2.48, y: 0, z: 0 },
    gravity: 5,
    mass: 50,
    length: 500,
    maxAngle: 120 * Math.PI / 180,
    interactionImpulse: 0.05,
    idleImpulse: { min: 0.005, max: 0.02 },
  },
}

export {
  ENVIRONMENT_OBJECTS_TYPE,
  ENVIRONMENT_OBJECTS_CONFIG,
  ENVIRONMENT_OBJECT_STATE,
  GHOSTS_COLOR_TYPE,
  GHOSTS_COLOR_QUEUE,
};
