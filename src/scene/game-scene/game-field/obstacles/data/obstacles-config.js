const OBSTACLE_TYPE = {
  Grave01: 'GRAVE_01',
  Grave02: 'GRAVE_02',
  Grave03: 'GRAVE_03',
  Grave04: 'GRAVE_04',
  Grave05: 'GRAVE_05',
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

export { OBSTACLE_TYPE, OBSTACLE_CONFIG };
