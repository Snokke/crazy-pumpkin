import * as THREE from 'three';
import SCENE_CONFIG from '../../../core/configs/scene-config';

export default class CameraController extends THREE.Group {
  constructor(camera) {
    super();
    
    this._camera = camera;

    this._init();

  }

  update(dt) {

  }

  _init() {
    this._setCameraPosition();
    window.addEventListener('resize', () => this._onResize());
  }

  _setCameraPosition() {
    this._camera.position.x = 3;
    this._camera.position.y = 9;
    this._camera.position.z = 10;
    this._camera.lookAt(new THREE.Vector3(0, 0, 0.5));

    if (SCENE_CONFIG.isMobile && window.innerWidth < window.innerHeight) {
      this._camera.position.x = 3;
      this._camera.position.y = 13;
      this._camera.position.z = 14;
      this._camera.lookAt(new THREE.Vector3(-0.3, 0, 0.5));
    }
  }

  _onResize() {
    this._setCameraPosition();
  }
}
