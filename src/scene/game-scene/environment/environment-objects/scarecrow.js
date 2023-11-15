import * as THREE from 'three';
import Loader from '../../../../core/loader';
import Materials from '../../../../core/materials';
import EnvironmentObjectAbstract from './environment-object-abstract';
import { ENVIRONMENT_OBJECTS_TYPE } from './data/environment-objects-type';
import { ENVIRONMENT_OBJECTS_CONFIG, ENVIRONMENT_OBJECT_STATE } from './data/environment-objects-config';
import { randomBetween } from '../../../../core/helpers/helpers';

export default class Scarecrow extends EnvironmentObjectAbstract {
  constructor() {
    super();

    this._type = ENVIRONMENT_OBJECTS_TYPE.Scarecrow;
    this._view = null;
    this._idleAnimationTimer = null;

    this._previousSpeed = 0;
    this._speed = 0;
    this._direction = 1;

    this._init();
    this._startIdleAnimationTimer();
  }

  update(dt) {
    if (this._previousSpeed === this._speed) {
      return;
    }

    this._previousSpeed = this._speed;

    this._view.rotation.y += this._direction * this._speed * dt * 60 * 0.01;

    if (this._view.rotation.y > Math.PI * 2) {
      this._view.rotation.y -= Math.PI * 2;
    }

    if (this._view.rotation.y < 0) {
      this._view.rotation.y += Math.PI * 2;
    }

    if (this._speed > 0) {
      const speedDecrease = this._state === ENVIRONMENT_OBJECT_STATE.Interaction ? this._config.interactionSpeedDecrease : this._config.idleSpeedDecrease;
      this._speed -= speedDecrease * speedDecrease * dt * 60 * 0.01;
    } else {
      this.setState(ENVIRONMENT_OBJECT_STATE.Idle);
      this._speed = 0;
    }
  }

  onClick() {
    this.setState(ENVIRONMENT_OBJECT_STATE.Interaction);

    this._checkToChangeDirection();
    this._addImpulse(this._config.interactionImpulse);
  }

  _addImpulse(impulse) {
    this._speed += impulse;

    if (this._speed > this._config.maxSpeed) {
      this._speed = this._config.maxSpeed;
    }
  }

  _checkToChangeDirection() {
    if (this._speed === 0) {
      this._direction *= -1;
    }
  }

  _startIdleAnimation() {
    this.setState(ENVIRONMENT_OBJECT_STATE.IdleAnimation);
    
    this._direction = Math.random() > 0.5 ? 1 : -1;

    const impulse = randomBetween(this._config.idleImpulse.min, this._config.idleImpulse.max);
    this._addImpulse(impulse);
  }

  _init() {
    this._config = ENVIRONMENT_OBJECTS_CONFIG[this._type];

    const view = this._view = Loader.assets['environment-scarecrow'].scene.children[0].clone();
    this.add(view);

    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    view.material = material;

    const scale = 0.5;
    view.scale.set(scale, scale, scale);
    view.position.multiplyScalar(0.5);

    view.receiveShadow = true;
    view.castShadow = true;

    view.userData['type'] = this._type;
  }
}
