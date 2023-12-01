const OBSTACLE_TYPE = {
  Grave01: 'GRAVE_01',
  Grave02: 'GRAVE_02',
  Grave03: 'GRAVE_03',
  Grave04: 'GRAVE_04',
  Grave05: 'GRAVE_05',
  Random: 'RANDOM',
}

const OBSTACLE_CONFIG = {
  [OBSTACLE_TYPE.Grave01]: {
    modelName: 'grave-01',
    scale: 0.45,
    offsetY: -0.4,
    availableRotation: [0],
    mirrorXEnabled: false,
  },
  [OBSTACLE_TYPE.Grave02]: {
    modelName: 'grave-02',
    scale: 0.45,
    offsetY: -0.4,
    availableRotation: [0],
    mirrorXEnabled: true,
  },
  [OBSTACLE_TYPE.Grave03]: {
    modelName: 'grave-03',
    scale: 0.45,
    offsetY: -0.4,
    availableRotation: [0],
    mirrorXEnabled: true,
  },
  [OBSTACLE_TYPE.Grave04]: {
    modelName: 'grave-04',
    scale: 0.5,
    offsetY: -0.4,
    availableRotation: [0],
    mirrorXEnabled: false,
  },
  [OBSTACLE_TYPE.Grave05]: {
    modelName: 'grave-05',
    scale: 0.5,
    offsetY: -0.4,
    availableRotation: [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5],
    mirrorXEnabled: false,
  },
}

const ROUND_OBSTACLES_TYPE = {
  None: 'NONE',
  Random: 'RANDOM',
  Positions01: 'CUSTOM_POSITIONS_01',
  Positions02: 'CUSTOM_POSITIONS_02',
}

const ROUND_OBSTACLES_CONFIG = {
  [ROUND_OBSTACLES_TYPE.Positions01]: [
    { type: OBSTACLE_TYPE.Grave01, position: { row: 1, column: 1 } },
    { type: OBSTACLE_TYPE.Grave02, position: { row: 2, column: 5 } },
    { type: OBSTACLE_TYPE.Grave03, position: { row: 3, column: 4 } },
    { type: OBSTACLE_TYPE.Grave04, position: { row: 5, column: 2 } },
    { type: OBSTACLE_TYPE.Grave05, position: { row: 6, column: 6 } },
    { type: OBSTACLE_TYPE.Grave01, position: { row: 7, column: 0 } },
  ],
  [ROUND_OBSTACLES_TYPE.Positions02]: [
    { type: OBSTACLE_TYPE.Grave01, position: { row: 1, column: 1 } },
  ],
}

export {
  OBSTACLE_TYPE,
  OBSTACLE_CONFIG,
  ROUND_OBSTACLES_TYPE,
  ROUND_OBSTACLES_CONFIG,
};
