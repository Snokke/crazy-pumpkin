import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { ENVIRONMENT_OBJECT_STATE } from './data/environment-objects-config';
import { randomBetween } from '../../../../core/helpers/helpers';
import { MessageDispatcher } from 'black-engine';

export default class EnvironmentObjectAbstract extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._type = null;
    this._config = null;
    this._view = null;
    this._state = ENVIRONMENT_OBJECT_STATE.Idle;
  }

  update(dt) {}

  getMesh() {
    return this._view;
  }

  onClick() { }

  getState() {
    return this._state;
  }

  setState(state) {
    this._state = state;

    if (state === ENVIRONMENT_OBJECT_STATE.Idle) {
      this.events.post('onIdle', this._type);
    }

    if (state === ENVIRONMENT_OBJECT_STATE.Interaction || state === ENVIRONMENT_OBJECT_STATE.IdleAnimation) {
      this.events.post('onMoving', this._type);
    }
  }

  _startIdleAnimationTimer() {
    const spawnTime = randomBetween(this._config.idleAnimationTime.min, this._config.idleAnimationTime.max);

    this._idleAnimationTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, spawnTime)
      .start()
      .onComplete(() => {
        if (this._state === ENVIRONMENT_OBJECT_STATE.Idle) {
          this._startIdleAnimation();
        }

        this._startIdleAnimationTimer();
      });
  }

  _startIdleAnimation() { }
}
