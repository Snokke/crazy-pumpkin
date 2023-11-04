import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { GAME_CONFIG } from '../data/game-config';
import { LEVEL_CONFIG } from '../data/level-config';
import { BOARD_CONFIG } from './board-config';
import { GLOBAL_VARIABLES } from '../data/global-variables';
import Loader from '../../../../core/loader';
import Materials from '../../../../core/materials';
import { randomFromArray } from '../../../../core/helpers/helpers';

export default class NewBoard extends THREE.Group {
  constructor() {
    super();

    this._view = null;

    this._cellsTweens = [];
  }

  reset() {
    this.remove(this._view);
    this._removeCellsTweens();
  }

  init() {
    this._initCellsTweens();
    this._initField();
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

    // const tileModel = Loader.assets['tile'].scene.children[0].clone();
    // const geometry = tileModel.geometry;
    const geometry = new THREE.PlaneGeometry(cellSize, cellSize, 1, 1);
    const material = Materials.getMaterial(Materials.type.HalloweenBits);

    const view = this._view = new THREE.InstancedMesh(geometry, material, cellsAmount);
    this.add(view);
    view.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();

    const rotationY = [
      0,
      Math.PI / 2,
      Math.PI,
      Math.PI * 1.5,
    ];

    for (let i = 0; i < cellsAmount; i += 1) {
      dummy.position.x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + (i % fieldConfig.columns) * GAME_CONFIG.cellSize;
      dummy.position.z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + Math.floor(i / fieldConfig.columns) * GAME_CONFIG.cellSize;
      dummy.scale.setScalar(0.25);

      const randomYRotation = randomFromArray(rotationY);
      dummy.rotation.y = randomYRotation;

      dummy.updateMatrix();
      view.setMatrixAt(i, dummy.matrix);
      view.setColorAt(i, new THREE.Color(0xffffff));
    }
    
    view.instanceColor.needsUpdate = true;
    view.instanceMatrix.needsUpdate = true;
    view.receiveShadow = true;
  }
}
