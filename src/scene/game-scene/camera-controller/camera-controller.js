import * as THREE from 'three';
import SCENE_CONFIG from '../../../core/configs/scene-config';
import DEBUG_CONFIG from '../../../core/configs/debug-config';
import { CAMERA_CONFIG, CAMERA_STATE } from './camera-config';

export default class CameraController extends THREE.Group {
  constructor(camera, orbitControls) {
    super();
    
    this._camera = camera;
    this._orbitControls = orbitControls;

    this._isPointerDown = false;
    this._lastMouseX = 0;
    this._cameraObject = new THREE.Object3D();
    this._lookAtLerpObject = new THREE.Object3D();
    this._isRotationEnabled = false;

    this._state = CAMERA_STATE.Idle;
    this._currentLookAt = new THREE.Vector3(0, 0, 0);
    this._lastCameraPosition = new THREE.Vector3(0, 0, 0);

    this._init();
  }

  update(dt) {
    if (!DEBUG_CONFIG.orbitControls) {
      if (this._state === CAMERA_STATE.Rotation && this._cameraObject.position.distanceTo(this._camera.position) > 0.01) {
        this._camera.position.lerp(this._cameraObject.position, CAMERA_CONFIG.rotation.lerp);
        this._camera.lookAt(this._currentLookAt);
      } 

      if (this._state === CAMERA_STATE.Focusing)  {
        if (this._cameraObject.position.distanceTo(this._camera.position) > CAMERA_CONFIG.focus.minDistance) {
          this._camera.position.lerp(this._cameraObject.position, CAMERA_CONFIG.focus.positionLerp);
        } 
        
        this._camera.quaternion.slerp(this._lookAtLerpObject.quaternion, CAMERA_CONFIG.focus.lookAtLerp);
      }

      if (this._state === CAMERA_STATE.BackToPosition) {
        if (this._cameraObject.position.distanceTo(this._camera.position) > 0.01) {
          this._camera.position.lerp(this._cameraObject.position, CAMERA_CONFIG.backToPosition.positionLerp);
          this._camera.quaternion.slerp(this._lookAtLerpObject.quaternion, CAMERA_CONFIG.backToPosition.lookAtLerp);
        } else {
          this._camera.position.copy(this._lastCameraPosition);
          this._camera.lookAt(this._currentLookAt);
          this._state = CAMERA_STATE.Rotation;
        }
      }
    }
  }

  enableRotation() {
    this._state = CAMERA_STATE.Rotation;
  }

  onPointerDown() {
    this._isPointerDown = true;
  }

  onPointerUp() {
    this._isPointerDown = false;
  }

  onPointerMove(x, y) {
    if (this._isPointerDown && this._state === CAMERA_STATE.Rotation) {
      const deltaX = x - this._lastMouseX;

      this._cameraObject.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -deltaX * CAMERA_CONFIG.rotation.speed);

      const cameraAngle = this._cameraObject.position.angleTo(new THREE.Vector3(0, 0, 1));

      if (cameraAngle > CAMERA_CONFIG.rotation.maxAzimuthAngle) {
        this._cameraObject.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * CAMERA_CONFIG.rotation.speed);
      } else if (cameraAngle < -CAMERA_CONFIG.rotation.minAzimuthAngle) {
        this._cameraObject.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * CAMERA_CONFIG.rotation.speed);
      }
    }

    this._lastMouseX = x;
  }

  focusCameraOnObject(position) {
    this._state = CAMERA_STATE.Focusing;

    this._lastCameraPosition.copy(this._camera.position);

    this._cameraObject.position.copy(position);
    this._lookAtLerpObject.position.copy(this._camera.position);
    this._lookAtLerpObject.lookAt(position);
    this._lookAtLerpObject.rotateY(Math.PI);
  }

  backToPosition() {
    this._state = CAMERA_STATE.BackToPosition;

    this._cameraObject.position.copy(this._lastCameraPosition);
    this._lookAtLerpObject.position.copy(this._lastCameraPosition);
    this._lookAtLerpObject.lookAt(this._currentLookAt);
    this._lookAtLerpObject.rotateY(Math.PI);
  }

  _init() {
    this._setCameraPosition();
    window.addEventListener('resize', () => this._onResize());
  }

  _setCameraPosition() {
    this._camera.position.copy(CAMERA_CONFIG.startPosition.desktop.position);
    this._currentLookAt.copy(CAMERA_CONFIG.startPosition.desktop.lookAt);

    if (SCENE_CONFIG.isMobile && window.innerWidth < window.innerHeight) {
      this._camera.position.copy(CAMERA_CONFIG.startPosition.mobile.portrait.position);
      this._currentLookAt.copy(CAMERA_CONFIG.startPosition.mobile.portrait.lookAt);
    }

    this._camera.lookAt(this._currentLookAt);

    this._cameraObject.position.copy(this._camera.position);
    this._cameraObject.rotation.copy(this._camera.rotation);
  }

  _onResize() {
    this._setCameraPosition();
  }
}
