import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { OBSTACLE_CONFIG, OBSTACLE_TYPE } from './data/obstacles-config';
import { GAME_CONFIG } from '../data/game-config';
import { LEVEL_CONFIG } from '../data/level-config';
import { GLOBAL_VARIABLES } from '../data/global-variables';

export default class Obstacle extends THREE.Group {
  constructor(type) {
    super();

    this._type = type;
    this._config = OBSTACLE_CONFIG[type];

    this._view = null;
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
    this._view.position.y = 8;

    new TWEEN.Tween(this._view.position)
      .to({ y: 0.4 }, 600)
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
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
    const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

    this.position.set(x, 0, z);
  }

  getPosition() {
    return this._position;
  }

  _squeeze(squeezePower, duration, easing) {
    const squeezeSides = (1 - squeezePower) + 1;

    const tween = new TWEEN.Tween(this._view.scale)
      .to({ y: squeezePower, x: squeezeSides, z: squeezeSides }, duration)
      .easing(easing)
      .start();

    new TWEEN.Tween(this._view.position)
      .to({ y: 0.4 * squeezePower }, duration)
      .easing(easing)
      .start();

    return tween;
  }

  _init() {
    if (this._type === OBSTACLE_TYPE.Rock) {
      const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new THREE.MeshToonMaterial({ color: 0x808080 });
      const view = this._view = new THREE.Mesh(geometry, material);
      this.add(view);

      view.castShadow = true;

      view.position.y = 0.4;
    }

    if (this._type === OBSTACLE_TYPE.Tree) {
      const geometry = new THREE.ConeGeometry(0.65, 0.8, 4, 1, false);
      const material = new THREE.MeshToonMaterial({ color: 0x8b4513 });
      const view = this._view = new THREE.Mesh(geometry, material);
      this.add(view);

      view.castShadow = true;

      view.position.y = 0.4;
      view.rotation.y = Math.PI / 4;
    }
  }
}