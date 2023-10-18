import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { DIRECTION, GAME_FIELD_CONFIG } from '../data/game-field-config';
import { MessageDispatcher } from 'black-engine';
import { PLAYER_ACTIONS, PLAYER_JUMP_STATE, PLAYER_STATE } from './data/player-data';
import { PLAYER_CONFIG } from './data/player-config';
import { LEVEL_CONFIG } from '../data/level-config';

export default class Player extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._view = null;
    this._currentPosition = { row: 0, column: 0 };
    this._newPosition = { row: 0, column: 0 };
    this._jumpSpeed = 0;
    this._jumpHalfTime = null;
    this._goingUpTween = null;
    this._goingDownTween = null;
    this._idleSqueezeTweens = { scaleTween: null, positionTween: null };
    this._beforeJumpSqueezeTweens = { scaleTween: null, positionTween: null };
    this._afterJumpSqueezeTweens = { scaleTween: null, positionTween: null };
    this._rotationTween = null;
    this._moveToPositionTween = null;
    this._squeezeTop = 1 + PLAYER_CONFIG.jumpAnimation.squeezePower * PLAYER_CONFIG.jumpImpulse;
    this._squeezeSides = 1 - PLAYER_CONFIG.jumpAnimation.squeezePower * PLAYER_CONFIG.jumpImpulse;

    this._state = PLAYER_STATE.Idle;
    this._jumpState = PLAYER_JUMP_STATE.None;
    this._previousJumpState = PLAYER_JUMP_STATE.None;

    this._actions = null;
    this._nextAction = null;
    this._isNextActionAllowed = false;

    this._rotationByDirection = null;
    this._currentDirection = DIRECTION.Up;

    this._init();
  }

  update(dt) {
    this._updateJump(dt);

    const position = this._calculateCurrentPosition();

    if (position.row !== this._currentPosition.row || position.column !== this._currentPosition.column) {
      const previousPosition = this._currentPosition;
      this._currentPosition = position;
      this.events.post('positionChanged', this._currentPosition, previousPosition);
    }
  }

  startAction(action) {
    if (this._state !== PLAYER_STATE.Idle) {
      if (this._isNextActionAllowed) {
        this._nextAction = action;
      }

      return;
    }

    this._resetJumpingTweens();
    this._isNextActionAllowed = false;
    this._nextAction = null;
    this._actions[action]();
  }

  getNewPosition(direction) { 
    const newPosition = { row: this._currentPosition.row, column: this._currentPosition.column };

    switch (direction) {
      case DIRECTION.Up:
        newPosition.row--;
        break;

      case DIRECTION.Down:
        newPosition.row++;
        break;

      case DIRECTION.Left:
        newPosition.column--;
        break;

      case DIRECTION.Right:
        newPosition.column++;
        break;
    }

    return newPosition;
  }

  setPosition(position) {
    this._currentPosition = position;
    this._newPosition = position;

    const cellSize = GAME_FIELD_CONFIG.cellSize;
    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    this._view.position.x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + this._currentPosition.column * cellSize;
    this._view.position.z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + this._currentPosition.row * cellSize;
  }

  getPosition() {
    return this._currentPosition;
  }

  setDirection(direction) {
    this._currentDirection = direction;
    this._view.rotation.y = this._rotationByDirection[direction];
  }

  show() {
    this.visible = true;
    this._startIdleAnimation();
  }

  hide() {
    this.visible = false;
    this._reset();
  }

  _calculateCurrentPosition() {
    const cellSize = GAME_FIELD_CONFIG.cellSize;
    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const row = Math.round((this._view.position.z + fieldConfig.rows * cellSize * 0.5 - cellSize * 0.5) / cellSize);
    const column = Math.round((this._view.position.x + fieldConfig.columns * cellSize * 0.5 - cellSize * 0.5) / cellSize);

    return { row, column };
  }

  _updateJump(dt) {
    if (this._jumpState === PLAYER_JUMP_STATE.GoingUp || this._jumpState === PLAYER_JUMP_STATE.GoingDown) {
      this._view.position.y += this._jumpSpeed * dt * PLAYER_CONFIG.speed;
      this._jumpSpeed -= GAME_FIELD_CONFIG.gravity * PLAYER_CONFIG.mass * dt * PLAYER_CONFIG.speed;

      if (this._jumpSpeed < 0) {
        this._setJumpState(PLAYER_JUMP_STATE.GoingDown);
      }

      if (this._jumpState === PLAYER_JUMP_STATE.GoingDown && this._previousJumpState === PLAYER_JUMP_STATE.GoingUp) {        
        this._resetJumpingTweens();
        this._goingDownTween = this._squeeze(this._squeezeTop, this._jumpHalfTime, TWEEN.Easing.Sinusoidal.In);
        this._isNextActionAllowed = true;
      }

      if (this._jumpState === PLAYER_JUMP_STATE.GoingDown && this._view.position.y < PLAYER_CONFIG.halfHeight * this._squeezeTop) {
        this._view.position.y = PLAYER_CONFIG.halfHeight * this._squeezeTop;
        this._jumpSpeed = 0;
        this._showAnimationAfterJump();
      }
    }
  }

  _jumpByDirection(direction) {
    this._newPosition = this.getNewPosition(direction);

    this._rotateToDirection(direction);
    this._startJump();
  }

  _jumpInPlaceWithRotation(direction) {
    this._rotateToDirection(direction);
    this._startJump();
  }

  _jumpInPlace() {
    this._startJump();
  }

  _startJump() {
    this._state = PLAYER_STATE.Jump;
    this._stopIdleAnimation();
    this._showAnimationBeforeJump();
  }

  _showAnimationBeforeJump() {
    this._setJumpState(PLAYER_JUMP_STATE.SqueezeBeforeJumpPhase01);

    const scaleDifference = (this._view.scale.y - this._squeezeSides) / (1 - this._squeezeSides);
    const squeezeDuration = PLAYER_CONFIG.jumpAnimation.squeezeDuration * scaleDifference / PLAYER_CONFIG.speed;

    if (scaleDifference < PLAYER_CONFIG.jumpAnimation.disableAnimationBeforeJumpThreshold) {
      this._phase02BeforeJump();

      return;
    }

    this._beforeJumpSqueezeTweens = this._squeezeOnGround(this._squeezeSides, squeezeDuration, TWEEN.Easing.Sinusoidal.In);
    this._beforeJumpSqueezeTweens.positionTween.onComplete(() => {
      this._phase02BeforeJump();
    });
  }

  _phase02BeforeJump() {
    this._setJumpState(PLAYER_JUMP_STATE.SqueezeBeforeJumpPhase02);
    
    const duration = PLAYER_CONFIG.jumpAnimation.squeezeDuration * 0.5 / PLAYER_CONFIG.speed;
    this._beforeJumpSqueezeTweens = this._squeezeOnGround(this._squeezeTop, duration, TWEEN.Easing.Sinusoidal.In)
    this._beforeJumpSqueezeTweens.positionTween.onComplete(() => {
      this._setJumpState(PLAYER_JUMP_STATE.GoingUp);
      this._jumpSpeed = PLAYER_CONFIG.jumpImpulse;
      
      this._goingUpTween = this._squeeze(1, this._jumpHalfTime, TWEEN.Easing.Sinusoidal.In);
      this._moveToPosition(this._newPosition);
    });
  }

  _showAnimationAfterJump() {
    this._resetJumpingTweens();
    this._setJumpState(PLAYER_JUMP_STATE.SqueezeAfterJump);

    const duration = PLAYER_CONFIG.jumpAnimation.squeezeDuration / PLAYER_CONFIG.speed;
    this._afterJumpSqueezeTweens = this._squeezeOnGround(this._squeezeSides, duration, TWEEN.Easing.Sinusoidal.Out);
    this._afterJumpSqueezeTweens.positionTween.onComplete(() => {
      if (this._nextAction) {
        this._setJumpState(PLAYER_JUMP_STATE.None);
        this._state = PLAYER_STATE.Idle;
        this.startAction(this._nextAction);

        return;
      } 

      this._setJumpState(PLAYER_JUMP_STATE.None);
      this._state = PLAYER_STATE.Idle;
      this._startIdleAnimation(true);
    });
  }

  _squeezeOnGround(squeezePower, duration, easing) {
    const scaleTween = this._squeeze(squeezePower, duration, easing);

    const positionTween = new TWEEN.Tween(this._view.position)
      .to({ y: PLAYER_CONFIG.halfHeight * squeezePower }, duration)
      .easing(easing)
      .start();

    return { scaleTween, positionTween };
  }

  _squeeze(squeezePower, duration, easing) {
    const squeezeSides = (1 - squeezePower) + 1;

    const tween = new TWEEN.Tween(this._view.scale)
      .to({ y: squeezePower, x: squeezeSides, z: squeezeSides }, duration)
      .easing(easing)
      .start();

    return tween;
  }

  _moveToPosition(newPosition) {
    const coordinates = this._getCoordinatesFromPosition(newPosition);

    this._moveToPositionTween = new TWEEN.Tween(this._view.position)
      .to({ x: coordinates.x, z: coordinates.z }, this._jumpHalfTime * 2)
      .easing(TWEEN.Easing.Linear.None)
      .start();
  }

  _startIdleAnimation(startFromSecondPhase = false) {
    if (startFromSecondPhase) {
      this._playIdleAnimationPhase02();
    } else {
      const duration = PLAYER_CONFIG.idleAnimation.squeezeDuration / PLAYER_CONFIG.speed;
      this._idleSqueezeTweens = this._squeezeOnGround(PLAYER_CONFIG.idleAnimation.squeezePower, duration, TWEEN.Easing.Sinusoidal.InOut);
      this._idleSqueezeTweens.positionTween.onComplete(() => {        
        this._playIdleAnimationPhase02();
      });
    }
  }

  _playIdleAnimationPhase02() {
    const duration = PLAYER_CONFIG.idleAnimation.squeezeDuration / PLAYER_CONFIG.speed;
    this._idleSqueezeTweens = this._squeezeOnGround(1, duration, TWEEN.Easing.Sinusoidal.InOut);
    this._idleSqueezeTweens.positionTween.onComplete(() => {
      this._startIdleAnimation();
    });
  }

  _rotateToDirection(direction) {
    if (this._currentDirection === direction) {
      return;
    }

    let targetAngle = this._rotationByDirection[direction];

    if (this._currentDirection === DIRECTION.Down && direction === DIRECTION.Left) {
      targetAngle = -Math.PI / 2;
    }

    if (this._currentDirection === DIRECTION.Left && direction === DIRECTION.Down) {
      targetAngle = Math.PI * 2;
    }

    this._currentDirection = direction;

    this._rotationTween = new TWEEN.Tween(this._view.rotation)
      .to({ y: targetAngle }, this._jumpHalfTime * 2)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start()
      .onComplete(() => {
        this._view.rotation.y = this._rotationByDirection[direction];
      });
  }

  _setJumpState(state) {
    this._previousJumpState = this._jumpState;
    this._jumpState = state;
  }

  _getCoordinatesFromPosition(position) {
    const cellSize = GAME_FIELD_CONFIG.cellSize;
    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
    const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

    return { x, z };
  }

  _reset() {
    this._resetAllTweens();
    this._stopIdleAnimation();
    this._setJumpState(PLAYER_JUMP_STATE.None);
    this._state = PLAYER_STATE.Idle;
    this._currentDirection = DIRECTION.Up;
    this._view.scale.set(1, 1, 1);
    this._view.position.y = PLAYER_CONFIG.halfHeight;
    this._jumpSpeed = 0;
    this._nextAction = null;
    this._isNextActionAllowed = false;
  }

  _stopIdleAnimation() {
    this._idleSqueezeTweens.positionTween?.stop();
    this._idleSqueezeTweens.scaleTween?.stop();
  }

  _resetJumpingTweens() {
    this._goingUpTween?.stop();
    this._goingDownTween?.stop();
    this._beforeJumpSqueezeTweens.positionTween?.stop();
    this._beforeJumpSqueezeTweens.scaleTween?.stop();
    this._afterJumpSqueezeTweens.positionTween?.stop();
    this._afterJumpSqueezeTweens.scaleTween?.stop();
  }

  _resetAllTweens() {
    this._resetJumpingTweens();
    this._stopIdleAnimation();

    this._rotationTween?.stop();
    this._moveToPositionTween?.stop();
  }

  _init() {
    this._initView();
    this._initJumpTime();
    this._initActions();
    this._initHelpers();

    this.hide();
  }

  _initView() {
    const view = this._view = new THREE.Group();
    this.add(view);

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshToonMaterial({ color: 0xffa500 });
    const mesh = new THREE.Mesh(geometry, material);
    view.add(mesh);

    mesh.castShadow = true;
    // mesh.receiveShadow = true;

    const eyeGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const eyeMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    view.add(leftEye, rightEye);
    
    leftEye.position.x = -0.2;
    leftEye.position.y = 0.2;
    leftEye.position.z = 0.4;

    rightEye.position.x = 0.2;
    rightEye.position.y = 0.2;
    rightEye.position.z = 0.4;

    leftEye.receiveShadow = true;
    // rightEye.receiveShadow = true;
  
    view.position.y = PLAYER_CONFIG.halfHeight;

    this._rotationByDirection = {
      [DIRECTION.Down]: 0,
      [DIRECTION.Right]: Math.PI / 2,
      [DIRECTION.Up]: Math.PI,
      [DIRECTION.Left]: Math.PI * 1.5,
    };

    view.rotation.y = this._rotationByDirection[this._currentDirection];
  }

  _initJumpTime() {
    const jumpHeight = PLAYER_CONFIG.jumpImpulse * PLAYER_CONFIG.jumpImpulse / (2 * GAME_FIELD_CONFIG.gravity * PLAYER_CONFIG.mass * PLAYER_CONFIG.mass);
    this._jumpHalfTime = Math.sqrt(2 * jumpHeight / GAME_FIELD_CONFIG.gravity) * 1000 / PLAYER_CONFIG.speed;
  }

  _initActions() {
    this._actions = {
      [PLAYER_ACTIONS.JumpLeft]: () => this._jumpByDirection(DIRECTION.Left),
      [PLAYER_ACTIONS.JumpRight]: () => this._jumpByDirection(DIRECTION.Right),
      [PLAYER_ACTIONS.JumpUp]: () => this._jumpByDirection(DIRECTION.Up),
      [PLAYER_ACTIONS.JumpDown]: () => this._jumpByDirection(DIRECTION.Down),
      [PLAYER_ACTIONS.JumpInPlaceRotateLeft]: () => this._jumpInPlaceWithRotation(DIRECTION.Left),
      [PLAYER_ACTIONS.JumpInPlaceRotateRight]: () => this._jumpInPlaceWithRotation(DIRECTION.Right),
      [PLAYER_ACTIONS.JumpInPlaceRotateUp]: () => this._jumpInPlaceWithRotation(DIRECTION.Up),
      [PLAYER_ACTIONS.JumpInPlaceRotateDown]: () => this._jumpInPlaceWithRotation(DIRECTION.Down),
      [PLAYER_ACTIONS.JumpInPlace]: () => this._jumpInPlace(),
    }
  }

  _initHelpers() {
    this._initDirectionHelper();
  }

  _initDirectionHelper() {
    const arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0xff0000);
    this._view.add(arrowHelper);
  }

}
