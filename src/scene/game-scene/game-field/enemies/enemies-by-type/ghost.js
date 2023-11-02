import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import EnemyAbstract from './enemy-abstract';
import { LEVEL_CONFIG } from '../../data/level-config';
import { GAME_CONFIG } from '../../data/game-config';
import { ENEMY_STATE, ENEMY_TYPE } from '../data/enemy-data';
import { isEqualsPositions, lerp, randomBetween } from '../../../../../core/helpers/helpers';
import { DIRECTION, MAP_TYPE, ROTATION_BY_DIRECTION } from '../../data/game-data';
import { GHOST_CONFIG, GHOST_MOVEMENT_STATE } from '../data/ghost-config';
import { GLOBAL_VARIABLES } from '../../data/global-variables';
import Loader from '../../../../../core/loader';

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
    this._spawnShowTween = null;
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

    const speed = this._moveSpeed * dt * GHOST_CONFIG.speedMultiplier;

    const maxInclineAngle = speed * GHOST_CONFIG.inclineCoeff;
    this._view.rotation.x = lerp(this._view.rotation.x, maxInclineAngle, dt);

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
      this._updateGhostMap(newPosition);
      this.events.post('positionChanged');
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

    this._spawnShowTween = this._showSpawnAnimation();
    this._spawnShowTween.positionTween.onComplete(() => {
      this._view.material.opacity = GHOST_CONFIG.activeBodyOpacity;

      this._state = ENEMY_STATE.Active;
      this._movementState = GHOST_MOVEMENT_STATE.Moving;
      this.setBodyActivity(true);
      this._updateGhostMap(this._currentPosition);
      this.events.post('positionChanged');

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

    const ghostMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Ghost];
    this._removeGhostFromArray(ghostMap[this._currentPosition.row][this._currentPosition.column]);

    if (GAME_CONFIG.helpers) {
      this._positionHelper.visible = false;
      this._arrowHelper.visible = false;
    }
    
    this._spawnHideTween = this._showHideAnimation();
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

  stopTweens() {    
    this._rotationTween?.stop();
    this._spawnHideTween?.positionTween?.stop();
    this._spawnHideTween?.opacityTween?.stop();
    this._spawnHideTween?.inclineTween?.stop();
    this._spawnShowTween?.position?.stop();
    this._spawnShowTween?.opacity?.stop();

    this._lifeTimer?.stop();
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
    const duration = (Math.abs(this._viewGroup.rotation.y - targetAngle) * GHOST_CONFIG.turnRate) / GHOST_CONFIG.speedMultiplier;

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
    this._viewGroup.position.y = 1.7;

    const duration = GHOST_CONFIG.spawnAnimationDuration / GHOST_CONFIG.speedMultiplier;

    const opacityTween = new TWEEN.Tween(this._view.material)
      .to({ opacity: GHOST_CONFIG.inactiveBodyOpacity }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    const positionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ y: 0.2 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    return { positionTween, opacityTween };
  }

  _showHideAnimation() {
    const opacityObject = { value: GHOST_CONFIG.activeBodyOpacity };
    const duration = GHOST_CONFIG.spawnAnimationDuration / GHOST_CONFIG.speedMultiplier;

    const opacityTween = new TWEEN.Tween(opacityObject)
      .to({ value: 0 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        this._view.material.opacity = opacityObject.value;
      });

    const positionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ y: 1.7 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    const inclineTween = new TWEEN.Tween(this._view.rotation)
      .to({ x: 0 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    return { opacityTween, positionTween, inclineTween };
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

  _updateGhostMap(newPosition) {
    const ghostMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Ghost];

    if (this._currentPosition) {
      this._removeGhostFromArray(ghostMap[this._currentPosition.row][this._currentPosition.column]);
    }

    ghostMap[newPosition.row][newPosition.column].push(this);
  }

  _removeGhostFromArray(array) {
    const index = array.indexOf(this);

    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  _init() {
    this._initView(); 
    this._initHelpers();

    this.hide(true);
  }

  _initView() {
    const viewGroup = this._viewGroup = new THREE.Group();
    this.add(viewGroup);

    const view = this._view = Loader.assets['ghost'].scene.children[0].clone();
    viewGroup.add(view);

    const scale = 0.6;
    view.scale.set(scale, scale, scale);

    const texture = Loader.assets['ghost_basecolor'];
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: GHOST_CONFIG.activeBodyOpacity,
      map: texture,
    });

    view.material = material;
    view.castShadow = true;

    viewGroup.position.y = 0.2;
  }
}
