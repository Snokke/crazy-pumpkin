import * as THREE from 'three';
import SCENE_CONFIG from '../../../core/configs/scene-config';
import DEBUG_CONFIG from '../../../core/configs/debug-config';

export default class CameraController extends THREE.Group {
  constructor(camera, orbitControls) {
    super();
    
    this._camera = camera;
    this._orbitControls = orbitControls;

    this._init();
  }

  update(dt) {

  }

  enableOrbitControls() {
    if (!DEBUG_CONFIG.orbitControls) {
      this._orbitControls.enabled = true;
    }
  }

  disableOrbitControls() {
    if (!DEBUG_CONFIG.orbitControls) {
      this._orbitControls.enabled = false;
    }
  }

  _init() {
    this._setCameraPosition();
    this._configureOrbitControls();
    window.addEventListener('resize', () => this._onResize());
  }

  _setCameraPosition() {
    this._camera.position.x = 3;
    this._camera.position.y = 9;
    this._camera.position.z = 10;
    this._camera.lookAt(new THREE.Vector3(0, 0, 0));

    if (SCENE_CONFIG.isMobile && window.innerWidth < window.innerHeight) {
      this._camera.position.x = 3;
      this._camera.position.y = 13;
      this._camera.position.z = 14;
      this._camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  }

  _configureOrbitControls() {
    if (DEBUG_CONFIG.orbitControls) {
      this._orbitControls.panSpeed = 0.5;
      this._orbitControls.enablePan = true;
      this._orbitControls.enableZoom = true;
    } else {
      this._orbitControls.rotateSpeed = 0.35;
  
      this._orbitControls.enablePan = false;
      this._orbitControls.enableZoom = false;
  
      const polarAngle = 0.86;
      this._orbitControls.minPolarAngle = polarAngle;
      this._orbitControls.maxPolarAngle = polarAngle;
  
      const azimuthAngle = Math.PI / 4;
      this._orbitControls.maxAzimuthAngle = azimuthAngle;
      this._orbitControls.minAzimuthAngle = -azimuthAngle;
  
      this._orbitControls.enabled = false;
    }
  }

  _onResize() {
    this._setCameraPosition();
  }
}
