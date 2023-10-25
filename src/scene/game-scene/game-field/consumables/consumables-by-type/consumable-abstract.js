import * as THREE from 'three';
import { GAME_CONFIG } from '../../data/game-config';
import { LEVEL_CONFIG } from '../../data/level-config';
import { GLOBAL_VARIABLES } from '../../data/global-variables';
import { MessageDispatcher } from 'black-engine';
import { MAP_TYPE } from '../../data/game-data';

export default class ConsumableAbstract extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._position = null;
    this._type = null;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  getPosition() {
    return this._position;
  }

  getType() {
    return this._type;
  }

  setPosition(position) {
    this._position = position;

    const cellSize = GAME_CONFIG.cellSize;
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
    const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

    this.position.set(x, 0, z);

    const consumableMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable];
    consumableMap[position.row][position.column] = this;
  }
}
