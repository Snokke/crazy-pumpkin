import * as THREE from 'three';
import Loader from '../../../../core/loader';
import { ANIMATION_BY_REAL_NAME, ANIMATION_TYPE } from '../enemies/data/animations-data';

export default class SkeletonBoss extends THREE.Group {
  constructor() {
    super();

    this._view = null;
    this._mixer = null;

    this._animations = {};

    this._init();
  }

  update(dt) {
    this._mixer.update(dt);
  }

  _init() {
    this._initView();
    this._initMixer();
    this._initAnimations();

    setTimeout(() => {
      this._playAnimation(ANIMATION_TYPE.Idle);
    }, 500);
  }

  _initView() {
    const view = this._view = Loader.assets['minion'].scene;
    this.add(view);

    view.scale.set(0.8, 0.8, 0.8);

    // view.position.y = 2;
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
