import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { GAME_CONFIG } from '../data/game-config';
import { LEVEL_CONFIG } from '../data/level-config';
import Utils from '../../../../core/helpers/utils';
import { BOARD_CONFIG } from './board-config';
import { GLOBAL_VARIABLES } from '../data/global-variables';

export default class Board extends THREE.Group {
  constructor() {
    super();

    this._view = null;
    this._fieldHelper = null;

    this._cellsTweens = [];
    this._enemiesMap = [];
  }

  reset() {
    this.remove(this._view);
    this.remove(this._fieldHelper);
    this._removeCellsTweens();
  }

  init() {
    this._initCellsTweens();
    this._initField();
    this._initFieldHelper();
    this._initEnemiesMap();
  }

  debugChangedHelper() {
    if (GAME_CONFIG.helpers && !this._fieldHelper) {
      this._initFieldHelper();
    }

    this._fieldHelper.visible = GAME_CONFIG.helpers;
  }

  updateEnemiesMap(newEnemiesMap) {
    for (let row = 0; row < this._enemiesMap.length; row++) {
      for (let column = 0; column < this._enemiesMap[0].length; column++) {
        if (this._enemiesMap[row][column] !== newEnemiesMap[row][column]) {
          this._enemiesMap[row][column] = newEnemiesMap[row][column];
          this.updateCellColor({ row, column }, newEnemiesMap[row][column]);
        } 
      }
    }
  }

  updateCellColor(position, isEnemy) {
    const cellIndex = this._getCellIndex(position);
    const endColor = isEnemy ? new THREE.Color(BOARD_CONFIG.enemyColor) : new THREE.Color(0xaaaaaa);
    const currentColor = new THREE.Color();
    this._view.getColorAt(cellIndex, currentColor);

    const colorObject = { value: 0 };

    new TWEEN.Tween(colorObject)
      .to({ value: 1 }, 300)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start()
      .onUpdate(() => {
        const color = new THREE.Color().copy(currentColor).lerp(endColor, colorObject.value);
        this._view.setColorAt(cellIndex, color);
        this._view.instanceColor.needsUpdate = true;
      });
  }

  _getCellIndex(position) {
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const cellSize = GAME_CONFIG.cellSize;

    return Math.floor(position.column / cellSize) + Math.floor(position.row / cellSize) * fieldConfig.columns;
  }

  _circularWaveFromCell(position) {
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const cellSize = GAME_CONFIG.cellSize;
    const maxDistance = cellSize * 2;

    for (let row = 0; row < fieldConfig.rows; row += 1) {
      for (let column = 0; column < fieldConfig.columns; column += 1) {
        const distance = Math.sqrt(Math.pow(position.row - row, 2) + Math.pow(position.column - column, 2));

        if (distance <= maxDistance) {
          const delay = distance * 100;
          const height = 0.3 * (1 - distance / maxDistance) + 0.1;

          if (!(position.row === row && position.column === column)) { 
            this._riseCell({ row, column }, height, delay);
          }
        }
      }
    }
  }

  _riseCell(position, height, delay = 0) {
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const cellSize = GAME_CONFIG.cellSize;
    const cellIndex = Math.floor(position.column / cellSize) + Math.floor(position.row / cellSize) * fieldConfig.columns;

    const dummy = new THREE.Object3D();
    const matrix = new THREE.Matrix4();
    this._view.getMatrixAt(cellIndex, matrix);

    dummy.position.setFromMatrixPosition(matrix);
    dummy.rotation.setFromRotationMatrix(matrix);

    const duration = height / BOARD_CONFIG.cellMoveSpeed;

    this._cellsTweens[position.row][position.column] = new TWEEN.Tween(dummy.position)
      .to({ y: height }, duration * 1000 * 0.5)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .delay(delay)
      .start()
      .onUpdate(() => {
        dummy.updateMatrix();
        this._view.setMatrixAt(cellIndex, dummy.matrix);
        this._view.instanceMatrix.needsUpdate = true;
      })
      .onComplete(() => {
        this._cellsTweens[position.row][position.column] = new TWEEN.Tween(dummy.position)
          .to({ y: 0 }, duration * 1000 * 0.5)
          .easing(TWEEN.Easing.Sinusoidal.InOut)
          .start()
          .delay(delay)
          .onUpdate(() => {
            dummy.updateMatrix();
            this._view.setMatrixAt(cellIndex, dummy.matrix);
            this._view.instanceMatrix.needsUpdate = true;
          });
      });
  }

  _initCellsTweens() {
    this._cellsTweens = [];

    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;

    for (let i = 0; i < fieldConfig.rows; i += 1) {
      this._cellsTweens[i] = [];

      for (let j = 0; j < fieldConfig.columns; j += 1) {
        this._cellsTweens[i][j] = null;
      }
    }
  }

  _removeCellsTweens() {
    for (let i = 0; i < this._cellsTweens.length; i += 1) {
      for (let j = 0; j < this._cellsTweens[i].length; j += 1) {
        if (this._cellsTweens[i][j]) {
          this._cellsTweens[i][j].stop();
        }
      }
    }
  }

  _initField() {
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const cellSize = GAME_CONFIG.cellSize;
    const cellsAmount = fieldConfig.columns * fieldConfig.rows;

    const planeGeometry = new THREE.PlaneGeometry(cellSize * 0.98, cellSize * 0.98);
    const planeMaterial = new THREE.MeshToonMaterial();

    const view = this._view = new THREE.InstancedMesh(planeGeometry, planeMaterial, cellsAmount);
    this.add(view);
    view.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < cellsAmount; i += 1) {
      dummy.position.x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + (i % fieldConfig.columns) * GAME_CONFIG.cellSize;
      dummy.position.z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + Math.floor(i / fieldConfig.columns) * GAME_CONFIG.cellSize;

      dummy.rotation.x = -Math.PI / 2;

      dummy.updateMatrix();
      view.setMatrixAt(i, dummy.matrix);
      view.setColorAt(i, new THREE.Color(0xaaaaaa));
    }
    
    view.instanceColor.needsUpdate = true;
    view.instanceMatrix.needsUpdate = true;
    view.receiveShadow = true;
  }

  _initFieldHelper() {
    if (!GAME_CONFIG.helpers) {
      return;
    }

    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;

    const columnsSize = fieldConfig.columns * GAME_CONFIG.cellSize;
    const rowsSize = fieldConfig.rows * GAME_CONFIG.cellSize;

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

  _initEnemiesMap() {
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    this._enemiesMap = [];

    for (let i = 0; i < fieldConfig.rows; i += 1) {
      this._enemiesMap[i] = [];

      for (let j = 0; j < fieldConfig.columns; j += 1) {
        this._enemiesMap[i][j] = 0;
      }
    }
  }
}
