import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import EnemyAbstract from './enemy-abstract';
import { EVIL_PUMPKIN_CONFIG, EVIL_PUMPKIN_MOVEMENT_STATE } from '../data/evil-pumpkin-config';
import { GAME_CONFIG } from '../../data/game-config';
import { ENEMY_STATE, ENEMY_TYPE } from '../data/enemy-data';
import { DIRECTION, GAME_STATE, MAP_TYPE, ROTATION_BY_DIRECTION } from '../../data/game-data';
import { GLOBAL_VARIABLES } from '../../data/global-variables';
import { getCoordinatesFromPosition, randomFromArray } from '../../../../../core/helpers/helpers';
import { LEVEL_CONFIG } from '../../data/level-config';
import Loader from '../../../../../core/loader';

export default class EvilPumpkin extends EnemyAbstract {
  constructor() {
    super();

    this._type = ENEMY_TYPE.EvilPumpkin;

    this._view = null;
    this._viewGroup = null;
    this._innerCylinder = null;
    this._spawnHideTween = {};
    this._rotateTween = null;
    this._moveToPositionTween = null;
    this._movementState = EVIL_PUMPKIN_MOVEMENT_STATE.Idle;
    this._previousMovementState = EVIL_PUMPKIN_MOVEMENT_STATE.Idle;
    this._jumpHalfTime = null;
    this._timerWaitingToRotate = 0;
    this._newPosition = { row: 0, column: 0 };
    this._beforeJumpSqueezeTweens = {};
    this._afterJumpSqueezeTweens = {};
    this._goingDownTween = null;
    this._goingUpTween = null;
    this._jumpSpeed = 0;
    this._squeezeTop = 1 + EVIL_PUMPKIN_CONFIG.jumpAnimation.squeezePower * EVIL_PUMPKIN_CONFIG.jumpImpulse;
    this._squeezeSides = 1 - EVIL_PUMPKIN_CONFIG.jumpAnimation.squeezePower * EVIL_PUMPKIN_CONFIG.jumpImpulse;
    this._waitingToRotateTime = 0;

    this._init();
  }

  update(dt) {
    this._updateWaitingToRotate(dt);
    this._updateJump(dt);

    const position = this._calculateCurrentPosition();

    if (position.row !== this._currentPosition.row || position.column !== this._currentPosition.column) {
      this._updateEvilPumpkinMap(position);
      this._currentPosition = position;
      this.events.post('positionChanged');

      if (GAME_CONFIG.helpers) {
        this._positionHelper.setPosition(position);
      }
    }
  }

  spawn() {
    this.show();

    this._spawnHideTween = this._showSpawnAnimation();
    this._spawnHideTween.scaleTween?.onComplete(() => {
      this._state = ENEMY_STATE.Active;

      this._view.material.opacity = 1;
      this._innerCylinder.visible = true;

      const waitingTime = EVIL_PUMPKIN_CONFIG.waitingToRotateTime;
      this._waitingToRotateTime = (waitingTime.min + Math.random() * (waitingTime.max - waitingTime.min)) / EVIL_PUMPKIN_CONFIG.speedMultiplier;

      this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.WaitingToRotate);
      this.setBodyActivity(true);
      this._updateEvilPumpkinMap(this._currentPosition);
      this.events.post('positionChanged');

      if (GAME_CONFIG.helpers) {
        this._positionHelper.visible = true;
        this._arrowHelper.visible = true;
      }
    });
  }

  kill() {
    this._state = ENEMY_STATE.Idle;
    this._movementState = EVIL_PUMPKIN_MOVEMENT_STATE.Idle;
    this._previousMovementState = EVIL_PUMPKIN_MOVEMENT_STATE.Idle;
    this.setBodyActivity(false);
    this.stopTweens();

    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];
    evilPumpkinMap[this._currentPosition.row][this._currentPosition.column] = null;

    if (GAME_CONFIG.helpers) {
      this._positionHelper.visible = false;
      this._arrowHelper.visible = false;
    }
    
    this._spawnHideTween = this._showHideAnimation();
    this._spawnHideTween.scaleTween?.onComplete(() => {
      this.hide();
      this.reset();
      this.events.post('onKilled', this);
    });
  }

  setSpawnPosition() {
    const randomPosition = this._getRandomPosition();
    this.setPosition(randomPosition);

    if (this._positionHelper) {
      this._positionHelper.setPosition(randomPosition);
    }

    const availableDirections = this._getAvailableDirections();
    const randomDirection = randomFromArray(availableDirections);
    this.setDirection(randomDirection);
  }

  setPosition(position) {
    super.setPosition(position);
    this._newPosition = position;
  }

  updateJumpTime() {
    const jumpHeight = EVIL_PUMPKIN_CONFIG.jumpImpulse * EVIL_PUMPKIN_CONFIG.jumpImpulse / (2 * GAME_CONFIG.gravity * EVIL_PUMPKIN_CONFIG.mass * EVIL_PUMPKIN_CONFIG.mass);
    this._jumpHalfTime = Math.sqrt(2 * jumpHeight / GAME_CONFIG.gravity) * 1000 / EVIL_PUMPKIN_CONFIG.speedMultiplier;
  }

  reset() {
    this._movementState = EVIL_PUMPKIN_MOVEMENT_STATE.Idle;
    this._previousMovementState = EVIL_PUMPKIN_MOVEMENT_STATE.Idle;
    this._currentDirection = null;
    this._currentPosition = null;
    this._newPosition = null;
    this._timerWaitingToRotate = 0;
    this._jumpSpeed = 0;
    this._viewGroup.position.y = EVIL_PUMPKIN_CONFIG.halfHeight;
    this._viewGroup.rotation.y = 0;
    this._viewGroup.scale.set(1, 1, 1);
    this._view.material.opacity = 1;
    this._innerCylinder.visible = false;
    this.stopTweens();
  }

  stopTweens() {    
    this._spawnHideTween?.scaleTween?.stop();
    this._spawnHideTween?.positionTween?.stop();
    this._rotateTween?.stop();
    this._moveToPositionTween?.stop();
    this._resetJumpingTweens();
  }

  _updateWaitingToRotate(dt) {
    if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.WaitingToRotate) {
      this._timerWaitingToRotate += dt * 1000;

      if (this._timerWaitingToRotate >= this._waitingToRotateTime) {
        this._timerWaitingToRotate = 0;
        this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.Rotate);
        this._rotate();
      }
    }
  }

  _updateJump(dt) {  
    if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.GoingUp || this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.GoingDown) {
      this._viewGroup.position.y += this._jumpSpeed * dt * EVIL_PUMPKIN_CONFIG.speedMultiplier;
      this._jumpSpeed -= GAME_CONFIG.gravity * EVIL_PUMPKIN_CONFIG.mass * dt * EVIL_PUMPKIN_CONFIG.speedMultiplier;

      if (this._jumpSpeed < 0) {
        this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.GoingDown);
      }

      if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.GoingDown && this._previousMovementState === EVIL_PUMPKIN_MOVEMENT_STATE.GoingUp) {        
        this._resetJumpingTweens();
        this._goingDownTween = this._squeeze(this._squeezeTop, this._jumpHalfTime, TWEEN.Easing.Sinusoidal.In);
      }

      if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.GoingDown && this._viewGroup.position.y < EVIL_PUMPKIN_CONFIG.halfHeight * this._squeezeTop) {
        this._viewGroup.position.y = EVIL_PUMPKIN_CONFIG.halfHeight * this._squeezeTop;
        this._jumpSpeed = 0;
        this._showAnimationAfterJump();
      }
    }
  }

  _startJump() {
    if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.Idle || GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    this._showAnimationBeforeJump();
  }

  _isPositionAvailable(position) {
    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];

    if (obstacleMap[position.row][position.column] || evilPumpkinMap[position.row][position.column]) {
      return false;
    }

    return true;
  }

  _getNextPosition() {
    const currentPosition = this._currentPosition;
    const direction = this._currentDirection;

    let row = currentPosition.row;
    let column = currentPosition.column;

    if (direction === DIRECTION.Up) {
      row--;
    }

    if (direction === DIRECTION.Down) {
      row++;
    }

    if (direction === DIRECTION.Left) {
      column--;
    }

    if (direction === DIRECTION.Right) {
      column++;
    }

    return { row, column };
  }

  _calculateCurrentPosition() {
    const cellSize = GAME_CONFIG.cellSize;
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const row = Math.round((this._viewGroup.position.z + fieldConfig.rows * cellSize * 0.5 - cellSize * 0.5) / cellSize);
    const column = Math.round((this._viewGroup.position.x + fieldConfig.columns * cellSize * 0.5 - cellSize * 0.5) / cellSize);

    return { row, column };
  }

  _showAnimationAfterJump() {
    this._resetJumpingTweens();
    this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.SqueezeAfterJumpPhase01);

    const duration = EVIL_PUMPKIN_CONFIG.jumpAnimation.squeezeDuration / EVIL_PUMPKIN_CONFIG.speedMultiplier;
    this._afterJumpSqueezeTweens = this._squeezeOnGround(this._squeezeSides, duration, TWEEN.Easing.Sinusoidal.Out);
    this._afterJumpSqueezeTweens.positionTween?.onComplete(() => {
      this._phase02AfterJump();
    });
  }

  _phase02AfterJump() {
    this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.SqueezeAfterJumpPhase02);

    const duration = EVIL_PUMPKIN_CONFIG.jumpAnimation.squeezeDuration * 0.5 / EVIL_PUMPKIN_CONFIG.speedMultiplier;
    this._afterJumpSqueezeTweens = this._squeezeOnGround(1, duration, TWEEN.Easing.Sinusoidal.Out);
    this._afterJumpSqueezeTweens.positionTween?.onComplete(() => {
      const waitingTime = EVIL_PUMPKIN_CONFIG.waitingToRotateTime;
      this._waitingToRotateTime = (waitingTime.min + Math.random() * (waitingTime.max - waitingTime.min)) / EVIL_PUMPKIN_CONFIG.speedMultiplier;
      this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.WaitingToRotate);
    });
  }

  _showAnimationBeforeJump() {
    this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.SqueezeBeforeJumpPhase01);

    const scaleDifference = (this._viewGroup.scale.y - this._squeezeSides) / (1 - this._squeezeSides);
    const squeezeDuration = EVIL_PUMPKIN_CONFIG.jumpAnimation.squeezeDuration * scaleDifference / EVIL_PUMPKIN_CONFIG.speedMultiplier;

    this._beforeJumpSqueezeTweens = this._squeezeOnGround(this._squeezeSides, squeezeDuration, TWEEN.Easing.Sinusoidal.In);
    this._beforeJumpSqueezeTweens.positionTween?.onComplete(() => {
      this._phase02BeforeJump();
    });
  }

  _phase02BeforeJump() {
    this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.SqueezeBeforeJumpPhase02);
    
    const duration = EVIL_PUMPKIN_CONFIG.jumpAnimation.squeezeDuration * 0.5 / EVIL_PUMPKIN_CONFIG.speedMultiplier;
    this._beforeJumpSqueezeTweens = this._squeezeOnGround(this._squeezeTop, duration, TWEEN.Easing.Sinusoidal.In)
    this._beforeJumpSqueezeTweens.positionTween?.onComplete(() => {
      this._setMovementState(EVIL_PUMPKIN_MOVEMENT_STATE.GoingUp);
      const newPosition = this._getNextPosition();
      const isPositionAvailable = this._isPositionAvailable(newPosition);
      this._newPosition = isPositionAvailable ? newPosition : this._currentPosition;

      this._jumpSpeed = EVIL_PUMPKIN_CONFIG.jumpImpulse;
      
      this._goingUpTween = this._squeeze(1, this._jumpHalfTime, TWEEN.Easing.Sinusoidal.In);
      this._moveToPosition(this._newPosition);
    });
  }

  _moveToPosition(newPosition) {
    if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.Idle || GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    const coordinates = getCoordinatesFromPosition(newPosition);

    this._moveToPositionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ x: coordinates.x, z: coordinates.z }, this._jumpHalfTime * 2)
      .easing(TWEEN.Easing.Linear.None)
      .start();
  }

  _squeezeOnGround(squeezePower, duration, easing) {
    if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.Idle || GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    const scaleTween = this._squeeze(squeezePower, duration, easing);

    const positionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ y: EVIL_PUMPKIN_CONFIG.halfHeight * squeezePower }, duration)
      .easing(easing)
      .start();

    return { scaleTween, positionTween };
  }

  _squeeze(squeezePower, duration, easing) {
    if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.Idle || GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    const squeezeSides = (1 - squeezePower) + 1;

    const tween = new TWEEN.Tween(this._viewGroup.scale)
      .to({ y: squeezePower, x: squeezeSides, z: squeezeSides }, duration)
      .easing(easing)
      .start();

    return tween;
  }

  _setMovementState(state) {
    this._previousMovementState = this._movementState;
    this._movementState = state;
  }

  _rotate() {
    if (this._movementState === EVIL_PUMPKIN_MOVEMENT_STATE.Idle || GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    const availableDirections = this._getAvailableDirections();
    const randomDirection = randomFromArray(availableDirections);

    if (randomDirection === this._currentDirection) {
      this._startJump(this._currentDirection);
    } else {
      this._rotateToDirection(randomDirection)?.onComplete(() => {
        this._currentDirection = randomDirection;
        this._startJump(this._currentDirection);
      });
    }
  }

  _rotateToDirection(direction) {
    let targetAngle = ROTATION_BY_DIRECTION[direction];

    if (this._currentDirection === DIRECTION.Down && direction === DIRECTION.Left) {
      targetAngle = -Math.PI / 2;
    }

    if (this._currentDirection === DIRECTION.Left && direction === DIRECTION.Down) {
      targetAngle = Math.PI * 2;
    }

    this._currentDirection = direction;
    const duration = (Math.abs(this._viewGroup.rotation.y - targetAngle) * EVIL_PUMPKIN_CONFIG.turnRate) / EVIL_PUMPKIN_CONFIG.speedMultiplier;

    const tween = new TWEEN.Tween(this._viewGroup.rotation)
      .to({ y: targetAngle }, duration)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start();

    return tween;
  }

  _updateEvilPumpkinMap(newPosition) {
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];

    if (this._currentPosition) {
      evilPumpkinMap[this._currentPosition.row][this._currentPosition.column] = null;
    }

    evilPumpkinMap[newPosition.row][newPosition.column] = this;
  }

  _getAvailableDirections() {
    const availableDirections = [];

    const currentPosition = this._currentPosition;
    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];

    if (currentPosition.row - 1 >= 0 && !obstacleMap[currentPosition.row - 1][currentPosition.column] && !evilPumpkinMap[currentPosition.row - 1][currentPosition.column]) {
      availableDirections.push(DIRECTION.Up);
    }

    if (currentPosition.row + 1 < obstacleMap.length && !obstacleMap[currentPosition.row + 1][currentPosition.column] && !evilPumpkinMap[currentPosition.row + 1][currentPosition.column]) {
      availableDirections.push(DIRECTION.Down);
    }

    if (currentPosition.column - 1 >= 0 && !obstacleMap[currentPosition.row][currentPosition.column - 1] && !evilPumpkinMap[currentPosition.row][currentPosition.column - 1]) {
      availableDirections.push(DIRECTION.Left);
    }

    if (currentPosition.column + 1 < obstacleMap[0].length && !obstacleMap[currentPosition.row][currentPosition.column + 1] && !evilPumpkinMap[currentPosition.row][currentPosition.column + 1]) {
      availableDirections.push(DIRECTION.Right);
    }

    return availableDirections;
  }

  _getRandomPosition() {
    const obstaclesMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];
    const playerPosition = GLOBAL_VARIABLES.playerPosition;

    const randomRow = Math.floor(Math.random() * obstaclesMap.length);
    const randomColumn = Math.floor(Math.random() * obstaclesMap[0].length);

    if (obstaclesMap[randomRow][randomColumn] || evilPumpkinMap[randomRow][randomColumn] || (randomRow === playerPosition.row && randomColumn === playerPosition.column)) {
      return this._getRandomPosition();
    }

    return { row: randomRow, column: randomColumn };
  }

  _showHideAnimation() {
    const duration = EVIL_PUMPKIN_CONFIG.spawnAnimationDuration / EVIL_PUMPKIN_CONFIG.speedMultiplier;


    const scaleTween = new TWEEN.Tween(this._viewGroup.scale)
      .to({ y: 0 }, duration)
      .easing(TWEEN.Easing.Back.In)
      .start();

    const positionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ y: 0 }, duration)
      .easing(TWEEN.Easing.Back.In)
      .start();

    const opacityTween = new TWEEN.Tween(this._view.material)
      .to({ opacity: 0 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    return { scaleTween, positionTween, opacityTween };
  }

  _showSpawnAnimation() {
    this._viewGroup.scale.y = 0;
    this._viewGroup.position.y = 0;
    this._view.material.opacity = 0.5;
    this._innerCylinder.visible = false;
    const duration = EVIL_PUMPKIN_CONFIG.spawnAnimationDuration / EVIL_PUMPKIN_CONFIG.speedMultiplier;

    const scaleTween = new TWEEN.Tween(this._viewGroup.scale)
      .to({ y: 1 }, duration)
      .easing(TWEEN.Easing.Back.Out)
      .start();

    const positionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ y: EVIL_PUMPKIN_CONFIG.halfHeight }, duration)
      .easing(TWEEN.Easing.Back.Out)
      .start();

    return { scaleTween, positionTween };
  }

  _resetJumpingTweens() {
    this._goingUpTween?.stop();
    this._goingDownTween?.stop();
    this._beforeJumpSqueezeTweens.positionTween?.stop();
    this._beforeJumpSqueezeTweens.scaleTween?.stop();
    this._afterJumpSqueezeTweens.positionTween?.stop();
    this._afterJumpSqueezeTweens.scaleTween?.stop();
  }

  _init() {
    this._initView();
    this._initHelpers();
    this.updateJumpTime();

    this.hide(true);
  }

  _initView() {
    const viewGroup = this._viewGroup = new THREE.Group();
    this.add(viewGroup);

    const view = this._view = Loader.assets['evil-pumpkin'].scene.children[0].clone();
    viewGroup.add(view);

    const scale = 0.72;
    view.scale.set(scale, scale, scale);

    const texture = Loader.assets['pumpkin004_basecolor'];
    texture.flipY = false;
    // texture.encoding = THREE.SRGBColorSpace;

    const roughness = Loader.assets['pumpkin004_roughness'];
    roughness.flipY = false;

    const material = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 1,
      map: texture,
      roughnessMap: roughness,
      roughness: 0.6,
    });

    view.material = material;
    view.castShadow = true;

    const innerCylinderGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.5, 32, 1, true);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xe68631 });
    const cylinder = this._innerCylinder = new THREE.Mesh(innerCylinderGeometry, cylinderMaterial);
    viewGroup.add(cylinder);

    this._innerCylinder.visible = false;

    viewGroup.position.y = EVIL_PUMPKIN_CONFIG.halfHeight;
  }
}
