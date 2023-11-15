import Loader from '../../../../../core/loader';
import Materials from '../../../../../core/materials';
import { ENVIRONMENT_OBJECTS_CONFIG, ENVIRONMENT_OBJECT_STATE } from '../data/environment-objects-config';
import EnvironmentObjectAbstract from '../environment-object-abstract';

export default class PostSkullAbstract extends EnvironmentObjectAbstract {
  constructor() {
    super();

    this._view = null;

    this._angle = 0;
    this._aVelocity = 0;
    this._aAcceleration = 0;
    this._damping = null;
  }

  update(dt) {
    if (this._aVelocity === 0 && this._angle < 0.01 && this._angle > -0.01) {
      if (this._state !== ENVIRONMENT_OBJECT_STATE.Idle) {
        this.setState(ENVIRONMENT_OBJECT_STATE.Idle);
      }

      return;
    }

    this._damping = 0.995 - 0.0003 * this._config.mass / 3;

    this._aAcceleration = (-1 * this._config.gravity / this._config.length) * Math.sin(this._angle); 
    this._aVelocity += this._aAcceleration;                           
    this._aVelocity *= this._damping;         
    
    if (this._aVelocity < 0.0001 && this._aVelocity > -0.0001) {
      this._aVelocity = 0;
    }
    
    this._angle += this._aVelocity;    

    if (this._angle > this._config.maxAngle) {
      this._angle = this._config.maxAngle;
      this._aVelocity *= -1;
    }

    if (this._angle < -this._config.maxAngle) {
      this._angle = -this._config.maxAngle;
      this._aVelocity *= -1;
    }
    
    this._view.rotation.z = this._angle;
  }

  onClick() {
    this.setState(ENVIRONMENT_OBJECT_STATE.Interaction);

    if (this._aVelocity >= 0) {
      this._aVelocity += this._config.interactionImpulse;
    } else {
      this._aVelocity -= this._config.interactionImpulse;
    }
  }

  _startIdleAnimation() {
    this.setState(ENVIRONMENT_OBJECT_STATE.IdleAnimation);
    
    const direction = Math.random() > 0.5 ? 1 : -1;
    const impulse = Math.random() * (this._config.idleImpulse.max - this._config.idleImpulse.min) + this._config.idleImpulse.min;
    this._aVelocity += direction * impulse;
  }

  _init() {
    this._config = ENVIRONMENT_OBJECTS_CONFIG[this._type];
    this._damping = 0.995 - 0.0005 * this._config.mass;

    const view = this._view = Loader.assets['environment-post-skull'].scene.children[0].clone();
    this.add(view);

    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    view.material = material;

    const scale = 0.5;
    view.scale.set(scale, scale, scale);
    view.position.multiplyScalar(0.5);

    const position = this._config.position;
    view.position.add(position);

    view.receiveShadow = true;
    view.castShadow = true;

    view.userData['type'] = this._type;
  }
}
