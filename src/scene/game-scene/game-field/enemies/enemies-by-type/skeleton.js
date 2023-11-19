import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import EnemyAbstract from './enemy-abstract';
import { GAME_CONFIG } from '../../data/game-config';
import { ENEMY_STATE, ENEMY_TYPE } from '../data/enemy-data';
import { isEqualsPositions, randomFromArray } from '../../../../../core/helpers/helpers';
import { DIRECTION, MAP_TYPE, ROTATION_BY_DIRECTION } from '../../data/game-data';
import { GLOBAL_VARIABLES } from '../../data/global-variables';
import Loader from '../../../../../core/loader';
import { SKELETON_CONFIG, SKELETON_MOVEMENT_STATE } from '../data/skeleton-config';
import { ANIMATION_BY_REAL_NAME, ANIMATION_TYPE } from '../data/animations-data';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export default class Skeleton extends EnemyAbstract {
  constructor() {
    super();

    this._type = ENEMY_TYPE.Skeleton;

    this._positionHelper = null;
    this._arrowHelper = null;
    this._currentDirection = null;
    this._view = null;
    this._spawnShowTween = null;
    this._spawnHideTween = null;
    this._mixer = null;
    this._animations = {};
    this._currentAnimation = null;

    this._isCrossedCenter = false;
    this._movementState = SKELETON_MOVEMENT_STATE.Idle;

    this._init();
  }

  update(dt) {
    if (this._state !== ENEMY_STATE.Active) {
      return;
    }

    this._mixer.update(dt);
    this._updateMovement(dt);
  }

  spawn() {
    this.show();

    this._spawnShowTween = this._showSpawnAnimation();
    this._spawnShowTween.scaleTween.onComplete(() => {
      this._state = ENEMY_STATE.Active;
      this._movementState = SKELETON_MOVEMENT_STATE.Moving;
      this.setBodyActivity(true);
      this._updateSkeletonMap(this._currentPosition);
      this.events.post('positionChanged');

      if (GAME_CONFIG.helpers) {
        this._positionHelper.visible = true;
        this._arrowHelper.visible = true;
      }
    });
  }

  kill() {
    this._state = ENEMY_STATE.Idle;
    this._movementState = SKELETON_MOVEMENT_STATE.Idle;
    this.setBodyActivity(false);

    const skeletonMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Skeleton];
    skeletonMap[this._currentPosition.row][this._currentPosition.column] = null;

    if (GAME_CONFIG.helpers) {
      this._positionHelper.visible = false;
      this._arrowHelper.visible = false;
    }
    
    this._spawnHideTween = this._showHideAnimation();
    this._spawnHideTween.scaleTween.onComplete(() => {
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

  reset() {
    this._currentDirection = null;
    this._movementState = SKELETON_MOVEMENT_STATE.Idle;
    this.stopTweens();
  }

  stopTweens() {    
    this._rotationTween?.stop();
    this._spawnHideTween?.scaleTween?.stop();
    this._spawnShowTween?.scaleTween?.stop();
  }

  updateSpeedMultiplier() {
    if (SKELETON_CONFIG.speedMultiplier >= SKELETON_CONFIG.runAnimationTransitionMultiplier && this._currentAnimation === ANIMATION_TYPE.Walk) {
      this._playAnimation(ANIMATION_TYPE.Run);
    } 
    
    if (SKELETON_CONFIG.speedMultiplier < SKELETON_CONFIG.runAnimationTransitionMultiplier && this._currentAnimation === ANIMATION_TYPE.Run) {
      this._playAnimation(ANIMATION_TYPE.Walk);
    }

    const timeScale = this._currentAnimation === ANIMATION_TYPE.Walk ? SKELETON_CONFIG.speedMultiplier : SKELETON_CONFIG.speedMultiplier / SKELETON_CONFIG.runAnimationTransitionMultiplier;
    this._mixer.timeScale = timeScale;
  }

  _updateMovement(dt) {
    if (this._movementState !== SKELETON_MOVEMENT_STATE.Moving) {
      return;
    }

    const speed = SKELETON_CONFIG.moveSpeed * SKELETON_CONFIG.speedMultiplier * dt;

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

    if (this._isCrossedCenterCell() && !this._isCrossedCenter) {
      this._isCrossedCenter = true;
      const changeDirection = Math.random() < SKELETON_CONFIG.chanceToChangeDirection;

      if (changeDirection || !this._isNextCellAvailable()) {
        const availableDirections = this._getAvailableDirections();
        const randomDirection = randomFromArray(availableDirections);
        this._rotateToDirection(randomDirection);
      }
    }

    const newPosition = this.getPositionFromView();

    if (!isEqualsPositions(this._currentPosition, newPosition)) {
      this._updateSkeletonMap(newPosition);
      this.events.post('positionChanged');
      this._currentPosition = newPosition;
      this._isCrossedCenter = false;

      if (GAME_CONFIG.helpers) {
        this._positionHelper.setPosition(newPosition);
      }
    }
  }

  _isCrossedCenterCell() {
    const cellSize = GAME_CONFIG.cellSize;
    const currentPosition = this._viewGroup.position;

    const cellCenterX = Math.floor(currentPosition.x / cellSize) * cellSize + cellSize * 0.5;
    const cellCenterZ = Math.floor(currentPosition.z / cellSize) * cellSize + cellSize * 0.5;

    const isCrossedCenterCell = Math.abs(currentPosition.x - cellCenterX) < 0.03 && Math.abs(currentPosition.z - cellCenterZ) < 0.03;

    return isCrossedCenterCell;
  }

  _isNextCellAvailable() {
    const nextCell = this._getNextCell();
    return this._isCellAvailable(nextCell);
  }

  _getNextCell() {
    const nextCell = { row: this._currentPosition.row, column: this._currentPosition.column };

    switch (this._currentDirection) {
      case DIRECTION.Up:
        nextCell.row -= 1;
        break;
      case DIRECTION.Down:
        nextCell.row += 1;
        break;
      case DIRECTION.Left:
        nextCell.column -= 1;
        break;
      case DIRECTION.Right:
        nextCell.column += 1;
        break;
    }

    return nextCell;
  }

  _isCellAvailable(cell) {
    if (cell.row < 0 || cell.row >= GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle].length || cell.column < 0 || cell.column >= GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle][0].length) {
      return false;
    }

    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];
    const skeletonMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Skeleton];

    if (obstacleMap[cell.row][cell.column] || evilPumpkinMap[cell.row][cell.column] || skeletonMap[cell.row][cell.column]) {
      return false;
    }

    return true;
  }

  _showSpawnAnimation() {
    this._viewGroup.scale.set(0, 0, 0)

    const duration = SKELETON_CONFIG.spawnAnimationDuration / SKELETON_CONFIG.speedMultiplier;

    const scaleTween = new TWEEN.Tween(this._viewGroup.scale)
      .to({ x: 1, y: 1, z: 1 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    return { scaleTween };
  }

  _showHideAnimation() {
    const duration = SKELETON_CONFIG.spawnAnimationDuration / SKELETON_CONFIG.speedMultiplier;

    const scaleTween = new TWEEN.Tween(this._viewGroup.scale)
      .to({ x: 0, y: 0, z: 0 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    return { scaleTween };
  }

  _updateSkeletonMap(newPosition) {
    const skeletonMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Skeleton];

    if (this._currentPosition) {
      skeletonMap[this._currentPosition.row][this._currentPosition.column] = null;
    }

    skeletonMap[newPosition.row][newPosition.column] = this;
  }

  _getRandomPosition() {
    const obstaclesMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];
    const skeletonMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Skeleton];
    const playerPosition = GLOBAL_VARIABLES.playerPosition;

    const randomRow = Math.floor(Math.random() * obstaclesMap.length);
    const randomColumn = Math.floor(Math.random() * obstaclesMap[0].length);

    if (obstaclesMap[randomRow][randomColumn] || evilPumpkinMap[randomRow][randomColumn] || skeletonMap[randomRow][randomColumn] || (randomRow === playerPosition.row && randomColumn === playerPosition.column)) {
      return this._getRandomPosition();
    }

    return { row: randomRow, column: randomColumn };
  }

  _getAvailableDirections() {
    const availableDirections = [];

    const currentPosition = this._currentPosition;
    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];
    const skeletonMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Skeleton];

    if (currentPosition.row - 1 >= 0 && !obstacleMap[currentPosition.row - 1][currentPosition.column] && !evilPumpkinMap[currentPosition.row - 1][currentPosition.column] && !skeletonMap[currentPosition.row - 1][currentPosition.column]) {
      availableDirections.push(DIRECTION.Up);
    }

    if (currentPosition.row + 1 < obstacleMap.length && !obstacleMap[currentPosition.row + 1][currentPosition.column] && !evilPumpkinMap[currentPosition.row + 1][currentPosition.column] && !skeletonMap[currentPosition.row + 1][currentPosition.column]) {
      availableDirections.push(DIRECTION.Down);
    }

    if (currentPosition.column - 1 >= 0 && !obstacleMap[currentPosition.row][currentPosition.column - 1] && !evilPumpkinMap[currentPosition.row][currentPosition.column - 1] && !skeletonMap[currentPosition.row][currentPosition.column - 1]) {
      availableDirections.push(DIRECTION.Left);
    }

    if (currentPosition.column + 1 < obstacleMap[0].length && !obstacleMap[currentPosition.row][currentPosition.column + 1] && !evilPumpkinMap[currentPosition.row][currentPosition.column + 1] && !skeletonMap[currentPosition.row][currentPosition.column + 1]) {
      availableDirections.push(DIRECTION.Right);
    }

    return availableDirections;
  }

  _rotateToDirection(direction) {
    if (this._currentDirection === direction) {
      return;
    }

    this._movementState = SKELETON_MOVEMENT_STATE.Turning;

    let targetAngle = ROTATION_BY_DIRECTION[direction];

    if (this._currentDirection === DIRECTION.Down && direction === DIRECTION.Left) {
      targetAngle = -Math.PI / 2;
    }

    if (this._currentDirection === DIRECTION.Left && direction === DIRECTION.Down) {
      targetAngle = Math.PI * 2;
    }

    this._currentDirection = direction;
    const duration = (Math.abs(this._viewGroup.rotation.y - targetAngle) * SKELETON_CONFIG.turnRate) / SKELETON_CONFIG.speedMultiplier;

    this._rotationTween = new TWEEN.Tween(this._viewGroup.rotation)
      .to({ y: targetAngle }, duration)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start()
      .onComplete(() => {
        this._movementState = SKELETON_MOVEMENT_STATE.Moving;
      });
  }

  _init() {
    this._initView(); 
    this._initHelpers();
    this._initMixer();
    this._initAnimations();

    // const animations = [
    //   ANIMATION_TYPE.Idle,
    //   ANIMATION_TYPE.Walk,
    //   ANIMATION_TYPE.Cheer,
    //   ANIMATION_TYPE.Dance,
    // ];

    // const randomAnimation = randomFromArray(animations);

    this._playAnimation(ANIMATION_TYPE.Walk);
    this.updateSpeedMultiplier();

    this.hide(true);
  }

  _initView() {
    const viewGroup = this._viewGroup = new THREE.Group();
    this.add(viewGroup);

    const scene = Loader.assets['minion'].scene;
    const view = this._view = SkeletonUtils.clone(scene);
    viewGroup.add(view);

    const scale = 0.7;
    view.scale.set(scale, scale, scale);

    view.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }

  _initMixer() {
    this._mixer = new THREE.AnimationMixer(this._view);
  }

  _initAnimations() {
    const animations = Loader.assets['minion'].animations;

    animations.forEach(animation => {
      const action = this._mixer.clipAction(animation);
      this._setWeight(action, 1);
      action.play();
      action.stop();

      const animationType = ANIMATION_BY_REAL_NAME[animation.name];

      if (animationType) {
        this._animations[animationType] = action;
      }
    });
  }

  _playAnimation(animationName) {
    this._currentAnimation = animationName;
    const action = this._animations[animationName];
    action.play();
  }

  _setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }
}
