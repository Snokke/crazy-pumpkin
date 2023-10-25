import * as THREE from "three";
import { GAME_CONFIG } from "../data/game-config";
import { OBJECT_POSITION_HELPER_CONFIG } from "./object-position-helper-config";
import { LEVEL_CONFIG } from "../data/level-config";
import { GLOBAL_VARIABLES } from "../data/global-variables";

export default class ObjectPositionHelper extends THREE.Group {
  constructor(type) {
    super();

    this._type = type;
    this._config = OBJECT_POSITION_HELPER_CONFIG[type];

    this._view = null;

    this._init();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  setPosition(position) {
    if (!GAME_CONFIG.helpers) {
      return;
    }

    const cellSize = GAME_CONFIG.cellSize;
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
    const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

    this.position.set(x, this._config.y, z);
  }

  debugChangedHelper() {
    if (!this._view) {
      this._initView();
    }

    this.visible = GAME_CONFIG.helpers;
  }

  setBodyActive(isActive) {
    this._view.material.opacity = isActive ? 0.9 : 0.3;
  }

  _init() {
    this._initView();
    this.hide();
  }

  _initView() {
    if (!GAME_CONFIG.helpers) {
      return;
    }

    const size = GAME_CONFIG.cellSize;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshToonMaterial({
      color: this._config.color,
      transparent: true,
      opacity: 0.9,
    });
    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.rotation.x = -Math.PI / 2;

    view.receiveShadow = true;
  }
}
