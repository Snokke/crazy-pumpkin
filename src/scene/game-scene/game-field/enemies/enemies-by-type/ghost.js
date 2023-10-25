import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import EnemyAbstract from './enemy-abstract';
import { LEVEL_CONFIG } from '../../data/level-config';
import { GAME_CONFIG } from '../../data/game-config';
import { ENEMY_STATE, ENEMY_TYPE } from '../data/enemy-data';
import { isEqualsPositions, randomBetween } from '../../../../../core/helpers/helpers';
import { DIRECTION, ROTATION_BY_DIRECTION } from '../../data/game-data';
import { GHOST_CONFIG, GHOST_MOVEMENT_STATE } from '../data/ghost-config';
import { GLOBAL_VARIABLES } from '../../data/global-variables';

export default class Ghost extends EnemyAbstract {
  constructor() {
    super();

    this._type = ENEMY_TYPE.Ghost;

    this._positionHelper = null;
    this._arrowHelper = null;
    this._currentDirection = null;
    this._rotationTween = null;
    this._view = null;
    this._lifeTimer = null;
    this._spawnHideTween = null;

    this._moveSpeed = 0;
    this._movementState = GHOST_MOVEMENT_STATE.Idle;

    this._init();
  }

  update(dt) {
    if (this._state !== ENEMY_STATE.Active || this._movementState !== GHOST_MOVEMENT_STATE.Moving) {
      return;
    }

    const cellSize = GAME_CONFIG.cellSize;
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;

    const speed = this._moveSpeed * dt;

    switch (this._currentDirection) {
      case DIRECTION.Up:
        this._viewGroup.position.z -= speed;
        break;
      case DIRECTION.Down:
        this._viewGroup.position.z += speed;
        break;
      case DIRECTION.Left:
        this._viewGroup.position.x -= speed;
        break;
      case DIRECTION.Right:
        this._viewGroup.position.x += speed;
        break;
    }

    if (this._viewGroup.position.z < (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5)) {
      this._rotateToDirection(DIRECTION.Down);
    }

    if (this._viewGroup.position.z > (fieldConfig.rows * cellSize * 0.5 - cellSize * 0.5)) {
      this._rotateToDirection(DIRECTION.Up);
    }

    if (this._viewGroup.position.x < (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5)) {
      this._rotateToDirection(DIRECTION.Right);
    }

    if (this._viewGroup.position.x > (fieldConfig.columns * cellSize * 0.5 - cellSize * 0.5)) {
      this._rotateToDirection(DIRECTION.Left);
    }

    const newPosition = this.getPositionFromView();

    if (!isEqualsPositions(this._currentPosition, newPosition)) {
      this.events.post('positionChanged', newPosition, this._currentPosition);
      this._currentPosition = newPosition;

      if (GAME_CONFIG.helpers) {
        this._positionHelper.setPosition(newPosition);
      }
    }
  }

  spawn() {
    this.show();

    if (this._lifeTimer) {
      this._lifeTimer.stop();
    }

    this._moveSpeed = Math.random() * (GHOST_CONFIG.moveSpeed.max - GHOST_CONFIG.moveSpeed.min) + GHOST_CONFIG.moveSpeed.min;

    this._spawnHideTween = this._showSpawnAnimation();
    this._spawnHideTween.positionTween.onComplete(() => {
      this._state = ENEMY_STATE.Active;
      this._movementState = GHOST_MOVEMENT_STATE.Moving;
      this.setBodyActivity(true);
      this.events.post('positionChanged', this._currentPosition, null);

      if (GAME_CONFIG.helpers) {
        this._positionHelper.visible = true;
        this._arrowHelper.visible = true;
      }

      this._startLifeTimer();
    });
  }

  kill() {
    this._state = ENEMY_STATE.Idle;
    this._movementState = GHOST_MOVEMENT_STATE.Idle;
    this.setBodyActivity(false);
    this.events.post('onRemoveFromMap', this._currentPosition);

    if (GAME_CONFIG.helpers) {
      this._positionHelper.visible = false;
      this._arrowHelper.visible = false;
    }
    
    this._spawnHideTween = this._showHideAnimation()
    this._spawnHideTween.positionTween.onComplete(() => {
      this.hide();
      this.reset();
      this.events.post('onKilled', this);
    });
  }

  setSpawnPosition() {
    const randomSide = Math.round(Math.random() * 3);
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;

    let position = null;

    switch (randomSide) {
      case 0:
        position = { row: 0, column: Math.round(Math.random() * (fieldConfig.columns - 1)) };
        this.setDirection(DIRECTION.Down);
        break;
      case 1:
        position = { row: fieldConfig.rows - 1, column: Math.round(Math.random() * (fieldConfig.columns - 1)) };
        this.setDirection(DIRECTION.Up);
        break;
      case 2:
        position = { row: Math.round(Math.random() * (fieldConfig.rows - 1)), column: 0 };
        this.setDirection(DIRECTION.Right);
        break;
      case 3:
        position = { row: Math.round(Math.random() * (fieldConfig.rows - 1)), column: fieldConfig.columns - 1 };
        this.setDirection(DIRECTION.Left);
        break;
    }

    this.setPosition(position);

    if (this._positionHelper) {
      this._positionHelper.setPosition(position);
    }
  }

  reset() {
    this._currentDirection = null;
    this._movementState = GHOST_MOVEMENT_STATE.Idle;
    this.stopTweens();
  }

  getType() {
    return this._type;
  }

  _rotateToDirection(direction) {
    if (this._currentDirection === direction) {
      return;
    }

    this._movementState = GHOST_MOVEMENT_STATE.Turning;

    let targetAngle = ROTATION_BY_DIRECTION[direction];

    if (this._currentDirection === DIRECTION.Down && direction === DIRECTION.Left) {
      targetAngle = -Math.PI / 2;
    }

    if (this._currentDirection === DIRECTION.Left && direction === DIRECTION.Down) {
      targetAngle = Math.PI * 2;
    }

    this._currentDirection = direction;
    const duration = Math.abs(this._viewGroup.rotation.y - targetAngle) * GHOST_CONFIG.turnRate;

    this._rotationTween = new TWEEN.Tween(this._viewGroup.rotation)
      .to({ y: targetAngle }, duration)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start()
      .onComplete(() => {
        this._movementState = GHOST_MOVEMENT_STATE.Moving;
      });
  }

  _showSpawnAnimation() {
    this._view.material.opacity = 0;
    this._leftEye.material.opacity = 0;
    this._rightEye.material.opacity = 0;
    this._viewGroup.position.y = 1.7;

    const opacityObject = { value: 0 };

    const opacityTween = new TWEEN.Tween(opacityObject)
      .to({ value: GHOST_CONFIG.opacity }, GHOST_CONFIG.spawnAnimationDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        this._view.material.opacity = opacityObject.value;
        this._leftEye.material.opacity = opacityObject.value;
        this._rightEye.material.opacity = opacityObject.value;
      });

    const positionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ y: 0.7 }, GHOST_CONFIG.spawnAnimationDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    return { opacityTween, positionTween };
  }

  _showHideAnimation() {
    const opacityObject = { value: GHOST_CONFIG.opacity };

    const opacityTween = new TWEEN.Tween(opacityObject)
      .to({ value: 0 }, GHOST_CONFIG.spawnAnimationDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        this._view.material.opacity = opacityObject.value;
        this._leftEye.material.opacity = opacityObject.value;
        this._rightEye.material.opacity = opacityObject.value;
      });

    const positionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ y: 1.7 }, GHOST_CONFIG.spawnAnimationDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    return { opacityTween, positionTween };
  }

  _startLifeTimer() {
    const lifeTime = Math.random() * (GHOST_CONFIG.lifeTime.max - GHOST_CONFIG.lifeTime.min) + GHOST_CONFIG.lifeTime.min;

    this._lifeTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, lifeTime)
      .start()
      .onComplete(() => {
        this.kill();
      });
  }

  stopTweens() {    
    this._rotationTween?.stop();
    this._spawnHideTween?.opacityTween.stop();
    this._spawnHideTween?.positionTween.stop();

    this._lifeTimer?.stop();
  }

  _init() {
    this._initView();
    this._initHelpers();

    this.hide(true);
  }

  _initView() {
    const viewGroup = this._viewGroup = new THREE.Group();
    this.add(viewGroup);

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshToonMaterial({
      color: 0xeeeeee,
      transparent: true,
      opacity: GHOST_CONFIG.opacity,
    });
    const view = this._view = new THREE.Mesh(geometry, material);

    const eyeGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const eyeMaterial = new THREE.MeshToonMaterial({
      color: 0x555555,
      transparent: true,
      opacity: GHOST_CONFIG.opacity,
    });
    const leftEye = this._leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = this._rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    viewGroup.add(leftEye);
    viewGroup.add(rightEye);

    leftEye.position.x = -0.2;
    leftEye.position.y = 0.2;
    leftEye.position.z = 0.4;

    rightEye.position.x = 0.2;
    rightEye.position.y = 0.2;
    rightEye.position.z = 0.4;

    viewGroup.add(view);

    viewGroup.position.y = 0.7;
  }
}
