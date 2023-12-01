import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { OBSTACLE_CONFIG } from './data/obstacles-config';
import { GAME_CONFIG } from '../data/game-config';
import { LEVEL_CONFIG } from '../data/level-config';
import { GLOBAL_VARIABLES } from '../data/global-variables';
import Loader from '../../../../core/loader';
import Materials from '../../../../core/materials';
import { randomFromArray } from '../../../../core/helpers/helpers';
import { PLAYER_CONFIG } from '../player/data/player-config';
import SCENE_CONFIG from '../../../../core/configs/scene-config';

export default class Obstacle extends THREE.Group {
  constructor(type) {
    super();

    this._type = type;
    this._config = OBSTACLE_CONFIG[type];

    this._view = null;
    this._viewGroup = null;
    this._position = null;

    this._init();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  showIntro(delay = 0) {
    const spawnPositionY = SCENE_CONFIG.isMobile ? PLAYER_CONFIG.spawnAnimation.mobile.positionY : PLAYER_CONFIG.spawnAnimation.desktop.positionY;
    const spawnDuration = SCENE_CONFIG.isMobile ? PLAYER_CONFIG.spawnAnimation.mobile.duration : PLAYER_CONFIG.spawnAnimation.desktop.duration;
    this._viewGroup.position.y = spawnPositionY;

    new TWEEN.Tween(this._viewGroup.position)
      .to({ y: 0.4 }, spawnDuration)
      .delay(delay)
      .easing(TWEEN.Easing.Cubic.In)
      .start()
      .onComplete(() => {
        this._squeeze(0.7, 75, TWEEN.Easing.Sinusoidal.Out).onComplete(() => {
          this._squeeze(1, 150, TWEEN.Easing.Sinusoidal.In);
        });
      });
  }

  setPosition(position) {
    this._position = position;

    const cellSize = GAME_CONFIG.cellSize;
    const fieldConfig = GAME_CONFIG.field;
    const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
    const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

    this.position.set(x, 0, z);
  }

  getPosition() {
    return this._position;
  }

  _squeeze(squeezePower, duration, easing) {
    const squeezeSides = (1 - squeezePower) + 1;

    const tween = new TWEEN.Tween(this._viewGroup.scale)
      .to({ y: squeezePower, x: squeezeSides, z: squeezeSides }, duration)
      .easing(easing)
      .start();

    new TWEEN.Tween(this._viewGroup.position)
      .to({ y: 0.4 * squeezePower }, duration)
      .easing(easing)
      .start();

    return tween;
  }

  _init() {
    this._initView();
  }

  _initView() {
    const viewGroup = this._viewGroup = new THREE.Group();
    this.add(viewGroup);

    const modelName = this._config.modelName;
    const model = Loader.assets[modelName].scene.children[0];
    const geometry = model.geometry;
    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    const view = this._view = new THREE.Mesh(geometry, material);
    viewGroup.add(view);

    view.scale.set(this._config.scale, this._config.scale, this._config.scale);
    view.position.y = this._config.offsetY;

    view.castShadow = true;
    view.receiveShadow = true;

    const randomAngleY = randomFromArray(this._config.availableRotation);
    viewGroup.rotation.y = randomAngleY;

    if (this._config.mirrorXEnabled) {
      const randomMirrorX = randomFromArray([-this._config.scale, this._config.scale]);
      view.scale.x = randomMirrorX;
    }
  }
}