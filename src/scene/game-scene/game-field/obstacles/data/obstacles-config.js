const OBSTACLE_TYPE = {
  TreeOrange: 'ROCK',
  TreeYellow: 'TREE',
  PostSkull: 'POST_SKULL',
  PostLantern: 'POST_LANTERN',
  Grave: 'GRAVE',
  GraveDestroyed: 'GRAVE_DESTROYED',
}

const OBSTACLE_CONFIG = {
  [OBSTACLE_TYPE.TreeOrange]: {
    modelName: 'tree-orange-small',
    scale: 0.45,
    offsetY: -0.3,
    availableRotation: [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5],
  },
  [OBSTACLE_TYPE.TreeYellow]: {
    modelName: 'tree-yellow-small',
    scale: 0.45,
    offsetY: -0.3,
    availableRotation: [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5],
  },
  [OBSTACLE_TYPE.PostSkull]: {
    modelName: 'post-skull',
    scale: 0.45,
    offsetY: -0.4,
    availableRotation: [Math.PI * 0.5, Math.PI * 1.5],
  },
  [OBSTACLE_TYPE.PostLantern]: {
    modelName: 'post-lantern',
    scale: 0.45,
    offsetY: -0.4,
    availableRotation: [Math.PI * 0.5, Math.PI * 1.5],
  },
  [OBSTACLE_TYPE.Grave]: {
    modelName: 'grave-a',
    scale: 0.45,
    offsetY: -0.4,
    availableRotation: [0],
  },
  [OBSTACLE_TYPE.GraveDestroyed]: {
    modelName: 'grave-a-destroyed',
    scale: 0.45,
    offsetY: -0.4,
    availableRotation: [0],
  },
}

export { OBSTACLE_TYPE, OBSTACLE_CONFIG };
