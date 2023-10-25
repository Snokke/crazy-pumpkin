import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import ConsumableAbstract from './consumable-abstract';
import { CANDY_CONFIG } from '../data/candy-config';
import { CONSUMABLE_TYPE } from '../data/consumables-config';

export default class Candy extends ConsumableAbstract {
  constructor() {
    super();

    this._view = null;
    this._lifeTimer = null;
    this._type = CONSUMABLE_TYPE.Candy;

    this._idleRotationTween = null;
    this._idlePositionTween = null;
    this._spawnTween = {};
    this._hideAnimation = null;

    this._init();
  }

  show() {
    super.show();

    this.stopTweens();
    this._startLifeTimer();
    this._spawnTween = this._showSpawnAnimation();
    this._spawnTween.scaleTween.onComplete(() => {
      this._idleAnimation();
    });
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
      .to({ y: Math.PI }, duration)
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

    this._idleRotationTween = new TWEEN.Tween(this._view.rotation)
      .to({ y: Math.PI * 2 }, idleAnimationDuration)
      .repeat(Infinity)
      .start();

    this._idlePositionTween = new TWEEN.Tween(this._view.position)
      .to({ y: 0.4 }, idleAnimationDuration)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .repeat(Infinity)
      .yoyo(true)
      .start();
  }

  _startLifeTimer() {
    const lifeTime = Math.random() * (CANDY_CONFIG.lifeTime.max - CANDY_CONFIG.lifeTime.min) + CANDY_CONFIG.lifeTime.min;

    this._lifeTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, lifeTime)
      .start()
      .onComplete(() => {
        this.events.post('kill', this);
      });
  }

  _init() {
    const geometry = new THREE.IcosahedronGeometry(0.18, 0);
    const material = new THREE.MeshToonMaterial({ color: 0x00ff00 });
    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.castShadow = true;

    view.position.y = 0.3;
  }
}
