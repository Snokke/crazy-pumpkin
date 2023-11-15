import * as THREE from 'three';
import Loader from '../../../../core/loader';
import Materials from '../../../../core/materials';
import TWEEN from 'three/addons/libs/tween.module.js';
import { ENVIRONMENT_OBJECTS_CONFIG, ENVIRONMENT_OBJECTS_TYPE, ENVIRONMENT_OBJECT_STATE, GHOSTS_COLOR_QUEUE } from './data/environment-objects-config';
import EnvironmentObjectAbstract from './environment-object-abstract';
import { GLOBAL_VARIABLES } from '../../game-field/data/global-variables';

export default class OrangePumpkin extends EnvironmentObjectAbstract {
  constructor() {
    super();

    this._type = ENVIRONMENT_OBJECTS_TYPE.Pumpkin;
    this._view = null;

    this._squeezeTweens = {};

    this._init();
    this._startIdleAnimationTimer();
  }

  onClick() {
    this._resetTweens();

    this.setState(ENVIRONMENT_OBJECT_STATE.Interaction)
    this._squeezePumpkin(this._config.interactionSqueezePower);
    this._changeGhostsColor();
  }

  _squeezePumpkin(squeezePower) {
    const duration = this._config.squeezeDuration;
    this._squeezeTweens = this._squeezeOnGround(this._config.viewScale * squeezePower, duration, TWEEN.Easing.Sinusoidal.InOut);
    this._squeezeTweens.positionTween?.onComplete(() => {
      this._squeezeTweens = this._squeezeOnGround(this._config.viewScale, duration, TWEEN.Easing.Sinusoidal.InOut);
      this._squeezeTweens.positionTween?.onComplete(() => {
        this.setState(ENVIRONMENT_OBJECT_STATE.Idle);
      });
    });
  }

  _squeezeOnGround(squeezePower, duration, easing) {
    const scaleTween = this._squeeze(squeezePower, duration, easing);

    const positionTween = new TWEEN.Tween(this._view.position)
      .to({ y: 0 }, duration)
      .easing(easing)
      .start();

    return { scaleTween, positionTween };
  }

  _squeeze(squeezePower, duration, easing) {
    const squeezeSides = (this._config.viewScale - squeezePower) + this._config.viewScale;

    const tween = new TWEEN.Tween(this._view.scale)
      .to({ y: squeezePower, x: squeezeSides, z: squeezeSides }, duration)
      .easing(easing)
      .start();

    return tween;
  }

  _resetTweens() {
    this._squeezeTweens.scaleTween?.stop();
    this._squeezeTweens.positionTween?.stop();
  }

  _startIdleAnimation() {
    this.setState(ENVIRONMENT_OBJECT_STATE.IdleAnimation);
    this._squeezePumpkin(this._config.idleSqueezePower);
  }

  _changeGhostsColor() {
    const currentColor = GLOBAL_VARIABLES.ghostsColorType;
    const currentIndex = GHOSTS_COLOR_QUEUE.indexOf(currentColor);
    const nextIndex = currentIndex === GHOSTS_COLOR_QUEUE.length - 1 ? 0 : currentIndex + 1;
    GLOBAL_VARIABLES.ghostsColorType = GHOSTS_COLOR_QUEUE[nextIndex];

    this.events.post('onEnvironmentPumpkinClick');
  }

  _init() {
    this._config = ENVIRONMENT_OBJECTS_CONFIG[this._type];

    const view = this._view = Loader.assets['environment-pumpkin'].scene.children[0].clone();
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
