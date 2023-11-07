import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import EnemyAbstract from './enemy-abstract';
import { GAME_CONFIG } from '../../data/game-config';
import { ENEMY_STATE, ENEMY_TYPE } from '../data/enemy-data';
import { randomFromArray } from '../../../../../core/helpers/helpers';
import { DIRECTION, MAP_TYPE } from '../../data/game-data';
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

    this._moveSpeed = 0;
    this._movementState = SKELETON_MOVEMENT_STATE.Idle;

    this._init();
  }

  update(dt) {
    if (this._state !== ENEMY_STATE.Active) {
      return;
    }

    this._mixer.update(dt);
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
    console.log(randomPosition);
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

  _init() {
    this._initView(); 
    this._initHelpers();
    this._initMixer();
    this._initAnimations();

    const animations = [
      ANIMATION_TYPE.Idle,
      ANIMATION_TYPE.Walk,
      ANIMATION_TYPE.Cheer,
      ANIMATION_TYPE.Dance,
    ];

    const randomAnimation = randomFromArray(animations);

    this._playAnimation(randomAnimation);

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
    const action = this._animations[animationName];
    action.play();
  }

  _setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }
}
