import * as THREE from 'three';

export default class CameraController extends THREE.Group {
  constructor(camera) {
    super();
    
    this._camera = camera;

    this._setCameraPosition();
  }

  update(dt) {

  }

  _setCameraPosition() {
    this._camera.position.x = 3;
    this._camera.position.y = 9;
    this._camera.position.z = 10;

    this._camera.lookAt(new THREE.Vector3(0, 0, 0.5));
  }
}
