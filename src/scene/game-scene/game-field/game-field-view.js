import * as THREE from 'three';
import { GAME_FIELD_CONFIG } from './data/game-field-config';
import { LEVEL_CONFIG } from './data/level-config';
import Utils from '../../../core/helpers/utils';

export default class GameFieldView extends THREE.Group {
  constructor() {
    super();

    this._view = null;
    this._fieldHelper = null;
  }

  removeObjects() {
    this.remove(this._view);
    this.remove(this._fieldHelper);
  }

  init() {
    this._initField();
    this._initFieldHelper();
  }

  debugChangedHelper() {
    if (GAME_FIELD_CONFIG.helpers && !this._fieldHelper) {
      this._initFieldHelper();
    }

    this._fieldHelper.visible = GAME_FIELD_CONFIG.helpers;
  }

  _initField() {
    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;

    const planeGeometry = new THREE.PlaneGeometry(fieldConfig.columns * GAME_FIELD_CONFIG.cellSize, fieldConfig.rows * GAME_FIELD_CONFIG.cellSize);
    const planeMaterial = new THREE.MeshToonMaterial({ color: 0xaaaaaa });
    const view = this._view = new THREE.Mesh(planeGeometry, planeMaterial);
    this.add(view);

    view.rotation.x = -Math.PI / 2;
    view.receiveShadow = true;
  }

  _initFieldHelper() {
    if (!GAME_FIELD_CONFIG.helpers) {
      return;
    }

    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;

    const columnsSize = fieldConfig.columns * GAME_FIELD_CONFIG.cellSize;
    const rowsSize = fieldConfig.rows * GAME_FIELD_CONFIG.cellSize;

    const geometry = new THREE.PlaneGeometry(columnsSize, rowsSize, fieldConfig.columns, fieldConfig.rows);
    Utils.toQuads(geometry);

    const material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
    });

    const fieldHelper = this._fieldHelper = new THREE.LineSegments(geometry, material);
    this.add(fieldHelper);

    fieldHelper.rotation.x = Math.PI / 2;
    fieldHelper.position.y = 0.01;
  }
}
