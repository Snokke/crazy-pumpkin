import * as THREE from 'three';

const CAMERA_STATE = {
  Idle: 'IDLE',
  Rotation: 'ROTATION',
  Focusing: 'FOCUSING',
  BackToPosition: 'BACK_TO_POSITION',
}

const CAMERA_CONFIG = {
  startPosition: {
    desktop: { position: new THREE.Vector3(3, 9, 10), lookAt: new THREE.Vector3(0, 0, 0) },
    mobile: { 
      portrait: { position: new THREE.Vector3(3, 13, 14), lookAt: new THREE.Vector3(0, 0, 0) },
      landscape: { position: new THREE.Vector3(3, 9, 10), lookAt: new THREE.Vector3(0, 0, 0) },
    },
  },
  rotation: {
    speed: 0.01,
    maxAzimuthAngle: Math.PI / 3,
    lerp: 0.17,
  },
  focus: {
    positionLerp: 0.05,
    lookAtLerp: 0.1,
    minDistance: 4,
  },
  backToPosition: {
    positionLerp: 0.1,
    lookAtLerp: 0.1,
  },
}

export { CAMERA_CONFIG, CAMERA_STATE };