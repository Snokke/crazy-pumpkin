import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { GAME_CONFIG } from '../../data/game-config';
import { LEVEL_CONFIG } from '../../data/level-config';
import { GLOBAL_VARIABLES } from '../../data/global-variables';
import { MessageDispatcher } from 'black-engine';
import { MAP_TYPE } from '../../data/game-data';
import { getCoordinatesFromPosition } from '../../../../../core/helpers/helpers';

export default class ConsumableAbstract extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._position = null;
    this._type = null;
    this._config = null;
    this._lifeTimer = null;
    
    this._idleRotationTween = null;
    this._idlePositionTween = null;
    this._spawnTween = {};
    this._hideAnimation = null;
  }

  show() {
    this.visible = true;

    this.stopTweens();
    this._startLifeTimer();
    this._spawnTween = this._showSpawnAnimation();
    this._spawnTween.scaleTween.onComplete(() => {
      this._idleAnimation();
    });
  }

  hide() {
    this.visible = false;
  }

  kill(animation = true) {
    if (animation) {
      this._hideAnimation = this._showHideAnimation();
      this._hideAnimation.onComplete(() => {
        this.stopTweens();
        this.hide();
      });

      return;
    }

    this.stopTweens();
    this.hide();
  }

  stopTweens() {
    this._lifeTimer?.stop();
    this._idleRotationTween?.stop();
    this._idlePositionTween?.stop();
    this._spawnTween.scaleTween?.stop();
    this._spawnTween.rotationTween?.stop();
    this._spawnTween.positionTween?.stop();
    this._hideAnimation?.stop();
  }

  getPosition() {
    return this._position;
  }

  getCoordinates() {
    return getCoordinatesFromPosition(this._position);
  }

  getType() {
    return this._type;
  }

  setPosition(position) {
    this._position = position;

    const cellSize = GAME_CONFIG.cellSize;
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
    const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

    this.position.set(x, 0, z);

    const consumableMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable];
    consumableMap[position.row][position.column] = this;
  }

  _showHideAnimation() {
    const tween = new TWEEN.Tween(this._view.scale)
      .to({ x: 0, y: 0, z: 0 }, 300)
      .easing(TWEEN.Easing.Back.In)
      .start();

    return tween;
  }

  _showSpawnAnimation() {
    this._view.scale.set(0, 0, 0);
    this._view.position.y = 0.1;
    this._view.rotation.y = 0;
    const duration = 600;

    const scaleTween = new TWEEN.Tween(this._view.scale)
      .to({ x: 1, y: 1, z: 1 }, duration)
      .easing(TWEEN.Easing.Back.Out)
      .start();

    const rotationTween = new TWEEN.Tween(this._view.rotation)
      .to({ y: Math.PI * 0.5 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();

    const positionTween = new TWEEN.Tween(this._view.position)
      .to({ y: 0.3 }, duration)
      .easing(TWEEN.Easing.Back.Out)
      .start();

    return { scaleTween, rotationTween, positionTween };
  }

  _idleAnimation() {
    const idleAnimationDuration = 1800;

    const rotationObject = { y: 0 };

    this._idleRotationTween = new TWEEN.Tween(rotationObject)
      .to({ y: Math.PI * 2 }, idleAnimationDuration)
      .repeat(Infinity)
      .start()
      .onUpdate(() => {
        const delta = rotationObject.y - this._view.rotation.y;
        this._view.rotation.y += delta;

        if (this._view.rotation.y > Math.PI * 2) {
          this._view.rotation.y -= Math.PI * 2;
        }
      });

    this._idlePositionTween = new TWEEN.Tween(this._view.position)
      .to({ y: 0.4 }, idleAnimationDuration)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .repeat(Infinity)
      .yoyo(true)
      .start();
  }

  _startLifeTimer() {
    const lifeTime = Math.random() * (this._config.lifeTime.max - this._config.lifeTime.min) + this._config.lifeTime.min;

    this._lifeTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, lifeTime)
      .start()
      .onComplete(() => {
        this.events.post('kill', this);
      });
  }
}
