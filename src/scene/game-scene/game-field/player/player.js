import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { MessageDispatcher } from 'black-engine';
import { PLAYER_ACTIONS, PLAYER_JUMP_STATE, PLAYER_STATE } from './data/player-data';
import { PLAYER_CONFIG } from './data/player-config';
import { LEVEL_CONFIG } from '../data/level-config';
import { DIRECTION, ROTATION_BY_DIRECTION } from '../data/game-data';
import { GAME_CONFIG, ROUND_CONFIG } from '../data/game-config';
import { GLOBAL_VARIABLES } from '../data/global-variables';
import { getCoordinatesFromPosition } from '../../../../core/helpers/helpers';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from '../consumables/data/consumables-config';
import Loader from '../../../../core/loader';

export default class Player extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._viewGroup = null;
    this._arrowHelper = null;
    this._currentPosition = { row: 0, column: 0 };
    this._newPosition = { row: 0, column: 0 };
    this._jumpSpeed = 0;
    this._jumpHalfTime = null;
    this._goingUpTween = null;
    this._goingDownTween = null;
    this._speedBoosterTimer = null;
    this._invulnerabilityBoosterTimer = null;
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

    this._isBodyActive = true;
    this._currentDirection = DIRECTION.Up;

    this._init();
  }

  update(dt) {
    this._updateJump(dt);

    const position = this._calculateCurrentPosition();

    if (position.row !== this._currentPosition.row || position.column !== this._currentPosition.column) {
      this._currentPosition = GLOBAL_VARIABLES.playerPosition = position;
      this.events.post('positionChanged');
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
    this._currentPosition = GLOBAL_VARIABLES.playerPosition = position;
    this._newPosition = position;

    const cellSize = GAME_CONFIG.cellSize;
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    this._viewGroup.position.x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + this._currentPosition.column * cellSize;
    this._viewGroup.position.z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + this._currentPosition.row * cellSize;
  }

  getPosition() {
    return this._currentPosition;
  }

  setDirection(direction) {
    this._currentDirection = direction;
    this._viewGroup.rotation.y = ROTATION_BY_DIRECTION[direction];
  }

  onRoundChanged() {
    if (GLOBAL_VARIABLES.activeBooster === CONSUMABLE_TYPE.BoosterCandyPlayerSpeed) {
      return;
    }

    const round = GLOBAL_VARIABLES.round;
    const playerRoundConfig = ROUND_CONFIG.player[round];

    PLAYER_CONFIG.speedMultiplier = playerRoundConfig.speedMultiplier;
    this._updateJumpTime();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  startSpeedBooster() {
    const boosterConfig = CONSUMABLES_CONFIG[CONSUMABLE_TYPE.BoosterCandyPlayerSpeed];

    PLAYER_CONFIG.speedMultiplier = boosterConfig.speedMultiplier;
    this._updateJumpTime();

    this._speedBoosterTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, boosterConfig.duration)
      .start()
      .onComplete(() => {
        GLOBAL_VARIABLES.activeBooster = null;
        this.onRoundChanged();
      });
  }

  startInvulnerabilityBooster() {
    const boosterConfig = CONSUMABLES_CONFIG[CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability];
    this._isBodyActive = false;
    this._view.material.opacity = 0.8;

    this._invulnerabilityBoosterAnimation = new TWEEN.Tween(this._view.material)
      .to({ opacity: 0.4 }, 1000)
      .repeat(Infinity)
      .yoyo(true)
      .start();

    this._invulnerabilityBoosterTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, boosterConfig.duration)
      .start()
      .onComplete(() => {
        GLOBAL_VARIABLES.activeBooster = null;
        this._isBodyActive = true;
        this._invulnerabilityBoosterAnimation?.stop();
        this._view.material.opacity = 1;
      });
  }

  showIntro() {
    this.show();
    this._viewGroup.position.y = 8;

    new TWEEN.Tween(this._viewGroup.position)
      .to({ y: PLAYER_CONFIG.halfHeight }, 600)
      .easing(TWEEN.Easing.Cubic.In)
      .start()
      .onComplete(() => {
        const squeezeTween = this._squeezeOnGround(0.6, 50, TWEEN.Easing.Sinusoidal.Out);
        squeezeTween.positionTween?.onComplete(() => {
          this._startIdleAnimation(true);
          this.events.post('introFinished');
        });
      });
  }

  debugChangedHelper() {
    if (GAME_CONFIG.helpers && !this._fieldHelper) {
      this._initHelpers();
    }

    this._arrowHelper.visible = GAME_CONFIG.helpers;
  }

  isBodyActive() {
    return this._isBodyActive;
  }

  reset() {
    this._resetAllTweens();
    this._stopIdleAnimation();
    this._setJumpState(PLAYER_JUMP_STATE.None);
    this._state = PLAYER_STATE.Idle;
    this._currentDirection = DIRECTION.Up;
    this._viewGroup.scale.set(1, 1, 1);
    this._viewGroup.position.y = PLAYER_CONFIG.halfHeight;
    this._jumpSpeed = 0;
    this._nextAction = null;
    this._isNextActionAllowed = false;
    this._speedBoosterTimer?.stop();
    this._invulnerabilityBoosterTimer?.stop();
    this._isBodyActive = true;
    this._invulnerabilityBoosterAnimation?.stop();
    this._view.material.opacity = 1;
  }

  _calculateCurrentPosition() {
    const cellSize = GAME_CONFIG.cellSize;
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const row = Math.round((this._viewGroup.position.z + fieldConfig.rows * cellSize * 0.5 - cellSize * 0.5) / cellSize);
    const column = Math.round((this._viewGroup.position.x + fieldConfig.columns * cellSize * 0.5 - cellSize * 0.5) / cellSize);

    return { row, column };
  }

  _updateJump(dt) {
    if (this._jumpState === PLAYER_JUMP_STATE.GoingUp || this._jumpState === PLAYER_JUMP_STATE.GoingDown) {
      this._viewGroup.position.y += this._jumpSpeed * dt * PLAYER_CONFIG.speedMultiplier;
      this._jumpSpeed -= GAME_CONFIG.gravity * PLAYER_CONFIG.mass * dt * PLAYER_CONFIG.speedMultiplier;

      if (this._jumpSpeed < 0) {
        this._setJumpState(PLAYER_JUMP_STATE.GoingDown);
      }

      if (this._jumpState === PLAYER_JUMP_STATE.GoingDown && this._previousJumpState === PLAYER_JUMP_STATE.GoingUp) {
        this._resetJumpingTweens();
        this._goingDownTween = this._squeeze(this._squeezeTop, this._jumpHalfTime, TWEEN.Easing.Sinusoidal.In);
        this._isNextActionAllowed = true;
      }

      if (this._jumpState === PLAYER_JUMP_STATE.GoingDown && this._viewGroup.position.y < PLAYER_CONFIG.halfHeight * this._squeezeTop) {
        this._viewGroup.position.y = PLAYER_CONFIG.halfHeight * this._squeezeTop;
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

    const scaleDifference = (this._viewGroup.scale.y - this._squeezeSides) / (1 - this._squeezeSides);
    const squeezeDuration = PLAYER_CONFIG.jumpAnimation.squeezeDuration * scaleDifference / PLAYER_CONFIG.speedMultiplier;

    if (scaleDifference < PLAYER_CONFIG.jumpAnimation.disableAnimationBeforeJumpThreshold) {
      this._phase02BeforeJump();

      return;
    }

    this._beforeJumpSqueezeTweens = this._squeezeOnGround(this._squeezeSides, squeezeDuration, TWEEN.Easing.Sinusoidal.In);
    this._beforeJumpSqueezeTweens.positionTween?.onComplete(() => {
      this._phase02BeforeJump();
    });
  }

  _phase02BeforeJump() {
    this._setJumpState(PLAYER_JUMP_STATE.SqueezeBeforeJumpPhase02);

    const duration = PLAYER_CONFIG.jumpAnimation.squeezeDuration * 0.5 / PLAYER_CONFIG.speedMultiplier;
    this._beforeJumpSqueezeTweens = this._squeezeOnGround(this._squeezeTop, duration, TWEEN.Easing.Sinusoidal.In)
    this._beforeJumpSqueezeTweens.positionTween?.onComplete(() => {
      this._setJumpState(PLAYER_JUMP_STATE.GoingUp);
      this._jumpSpeed = PLAYER_CONFIG.jumpImpulse;

      this._goingUpTween = this._squeeze(1, this._jumpHalfTime, TWEEN.Easing.Sinusoidal.In);
      this._moveToPosition(this._newPosition);
    });
  }

  _showAnimationAfterJump() {
    this._resetJumpingTweens();
    this._setJumpState(PLAYER_JUMP_STATE.SqueezeAfterJump);

    const duration = PLAYER_CONFIG.jumpAnimation.squeezeDuration / PLAYER_CONFIG.speedMultiplier;
    this._afterJumpSqueezeTweens = this._squeezeOnGround(this._squeezeSides, duration, TWEEN.Easing.Sinusoidal.Out);
    this._afterJumpSqueezeTweens.positionTween?.onComplete(() => {
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

    const positionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ y: PLAYER_CONFIG.halfHeight * squeezePower }, duration)
      .easing(easing)
      .start();

    return { scaleTween, positionTween };
  }

  _squeeze(squeezePower, duration, easing) {
    const squeezeSides = (1 - squeezePower) + 1;

    const tween = new TWEEN.Tween(this._viewGroup.scale)
      .to({ y: squeezePower, x: squeezeSides, z: squeezeSides }, duration)
      .easing(easing)
      .start();

    return tween;
  }

  _moveToPosition(newPosition) {
    const coordinates = getCoordinatesFromPosition(newPosition);

    this._moveToPositionTween = new TWEEN.Tween(this._viewGroup.position)
      .to({ x: coordinates.x, z: coordinates.z }, this._jumpHalfTime * 2)
      .easing(TWEEN.Easing.Linear.None)
      .start();
  }

  _startIdleAnimation(startFromSecondPhase = false) {
    if (startFromSecondPhase) {
      this._playIdleAnimationPhase02();
    } else {
      const duration = PLAYER_CONFIG.idleAnimation.squeezeDuration / PLAYER_CONFIG.speedMultiplier;
      this._idleSqueezeTweens = this._squeezeOnGround(PLAYER_CONFIG.idleAnimation.squeezePower, duration, TWEEN.Easing.Sinusoidal.InOut);
      this._idleSqueezeTweens.positionTween?.onComplete(() => {
        this._playIdleAnimationPhase02();
      });
    }
  }

  _playIdleAnimationPhase02() {
    const duration = PLAYER_CONFIG.idleAnimation.squeezeDuration / PLAYER_CONFIG.speedMultiplier;
    this._idleSqueezeTweens = this._squeezeOnGround(1, duration, TWEEN.Easing.Sinusoidal.InOut);
    this._idleSqueezeTweens.positionTween?.onComplete(() => {
      this._startIdleAnimation();
    });
  }

  _rotateToDirection(direction) {
    if (this._currentDirection === direction) {
      return;
    }

    let targetAngle = ROTATION_BY_DIRECTION[direction];

    if (this._currentDirection === DIRECTION.Down && direction === DIRECTION.Left) {
      targetAngle = -Math.PI / 2;
    }

    if (this._currentDirection === DIRECTION.Left && direction === DIRECTION.Down) {
      targetAngle = Math.PI * 2;
    }

    this._currentDirection = direction;

    this._rotationTween = new TWEEN.Tween(this._viewGroup.rotation)
      .to({ y: targetAngle }, this._jumpHalfTime * 2)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start()
      .onComplete(() => {
        this._viewGroup.rotation.y = ROTATION_BY_DIRECTION[direction];
      });
  }

  _setJumpState(state) {
    this._previousJumpState = this._jumpState;
    this._jumpState = state;
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
    this._updateJumpTime();
    this._initActions();
    this._initHelpers();

    this.hide();
  }

  _initView() {
    const viewGroup = this._viewGroup = new THREE.Group();
    this.add(viewGroup);

    const view = this._view = Loader.assets['player-pumpkin'].scene.children[0].clone();
    viewGroup.add(view);

    const scale = 0.6;
    view.scale.set(scale, scale, scale);

    const texture = Loader.assets['pumpkin002_basecolor'];
    texture.flipY = false;
    // texture.encoding = THREE.SRGBColorSpace;

    const roughness = Loader.assets['pumpkin002_roughness'];
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

    const innerCylinderGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.37, 32, 1, true);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const cylinder = new THREE.Mesh(innerCylinderGeometry, cylinderMaterial);
    viewGroup.add(cylinder);

    viewGroup.position.y = PLAYER_CONFIG.halfHeight;
    viewGroup.rotation.y = ROTATION_BY_DIRECTION[this._currentDirection];
  }

  _updateJumpTime() {
    const jumpHeight = PLAYER_CONFIG.jumpImpulse * PLAYER_CONFIG.jumpImpulse / (2 * GAME_CONFIG.gravity * PLAYER_CONFIG.mass * PLAYER_CONFIG.mass);
    this._jumpHalfTime = Math.sqrt(2 * jumpHeight / GAME_CONFIG.gravity) * 1000 / PLAYER_CONFIG.speedMultiplier;
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
    if (!GAME_CONFIG.helpers) {
      return;
    }

    this._initDirectionHelper();
  }

  _initDirectionHelper() {
    const arrowHelper = this._arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0xff0000);
    this._viewGroup.add(arrowHelper);
  }
}
