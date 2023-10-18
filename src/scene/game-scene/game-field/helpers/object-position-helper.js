import * as THREE from "three";
import { GAME_FIELD_CONFIG } from "../data/game-field-config";
import { OBJECT_POSITION_HELPER_CONFIG } from "./object-position-helper-config";
import { LEVEL_CONFIG } from "../data/level-config";

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
    const cellSize = GAME_FIELD_CONFIG.cellSize;
    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
    const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

    this.position.set(x, 0.005, z);
  }

  _init() {
    this._initView();
    this.hide();
  }

  _initView() {
    const size = GAME_FIELD_CONFIG.cellSize;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshToonMaterial({ color: this._config.color });
    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.rotation.x = -Math.PI / 2;

    view.receiveShadow = true;
  }
}
