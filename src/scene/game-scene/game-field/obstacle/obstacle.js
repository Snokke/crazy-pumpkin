import * as THREE from 'three';
import { OBSTACLE_CONFIG, OBSTACLE_TYPE } from './data/obstacles-config';
import { GAME_FIELD_CONFIG } from '../data/game-field-config';
import { LEVEL_CONFIG } from '../data/level-config';

export default class Obstacle extends THREE.Group {
  constructor(type) {
    super();

    this._type = type;
    this._config = OBSTACLE_CONFIG[type];

    this._position = null;

    this._init();
  }

  setPosition(position) {
    this._position = position;

    const cellSize = GAME_FIELD_CONFIG.cellSize;
    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
    const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

    this.position.set(x, 0, z);
  }

  getPosition() {
    return this._position;
  }

  _init() {
    if (this._type === OBSTACLE_TYPE.Rock) {
      const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new THREE.MeshToonMaterial({ color: 0x444444 });
      const view = new THREE.Mesh(geometry, material);
      this.add(view);

      view.castShadow = true;

      view.position.y = 0.4;
    }

    if (this._type === OBSTACLE_TYPE.Tree) {
      const geometry = new THREE.ConeGeometry(0.65, 1, 4, 1, true);
      const material = new THREE.MeshToonMaterial({ color: 0x8b4513 });
      const view = new THREE.Mesh(geometry, material);
      this.add(view);

      view.castShadow = true;

      view.position.y = 0.4;
      view.rotation.y = Math.PI / 4;
    }
  }
}