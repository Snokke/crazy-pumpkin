import * as THREE from 'three';
import CONSUMABLE_CLASS from './data/consumables-class';
import { GAME_CONFIG } from '../data/game-config';
import { GAME_STATE, MAP_TYPE } from '../data/game-data';
import Delayed from '../../../../core/helpers/delayed-call';
import { CONSUMABLE_TYPE } from './data/consumables-config';
import { CANDY_CONFIG } from './data/candy-config';
import { randomBetween } from '../../../../core/helpers/helpers';
import { GLOBAL_VARIABLES } from '../data/global-variables';

export default class ConsumablesController extends THREE.Group {
  constructor() {
    super();

    this._consumablesPool = [];
    this._activeConsumables = [];
  }

  activateSpawnConsumables() {
    this._spawnCandy();
  }

  removeConsumable(consumable, hideAnimation) {
    const consumableMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable];
    const position = consumable.getPosition();
    consumableMap[position.row][position.column] = null;
    
    this._activeConsumables.splice(this._activeConsumables.indexOf(consumable), 1);
    this._consumablesPool.push(consumable);

    consumable.kill(hideAnimation);
  }

  reset() {
    this._activeConsumables.forEach(consumable => consumable.kill(false));
  }

  stopTweens() {
    this._activeConsumables.forEach(consumable => consumable.stopTweens());
  }

  _spawnCandy() {
    const spawnTime = randomBetween(CANDY_CONFIG.spawnTime.min, CANDY_CONFIG.spawnTime.max);

    Delayed.call(spawnTime, () => {
      if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
        return;
      }

      this._spawnConsumable(CONSUMABLE_TYPE.Candy);
      this._spawnCandy();
    });
  }

  _spawnConsumable(type) {
    const consumable = this._getConsumableFromPool(type);

    if (consumable) {
      this._consumablesPool.splice(this._consumablesPool.indexOf(consumable), 1);
      this._activeConsumables.push(consumable);

      const randomPosition = this._getRandomPosition();
      consumable.setPosition(randomPosition);
      consumable.show();

      return consumable;
    }

    const consumableClass = CONSUMABLE_CLASS[type];
    const newConsumable = new consumableClass();
    this.add(newConsumable);

    this._activeConsumables.push(newConsumable);

    const randomPosition = this._getRandomPosition();
    newConsumable.setPosition(randomPosition);
    newConsumable.show();

    this._initConsumableSignals(newConsumable);

    return newConsumable;
  }

  _initConsumableSignals(consumable) {
    consumable.events.on('kill', (msg, killedConsumable) => this.removeConsumable(killedConsumable, true));
  }

  _getConsumableFromPool(type) {
    const consumable = this._consumablesPool.find(consumable => consumable.type === type);

    if (consumable) {
      return consumable;
    }

    return null;
  }

  _getRandomPosition() {
    const obstaclesMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];
    const consumablesMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable];
    const playerPosition = GLOBAL_VARIABLES.playerPosition;

    const randomRow = Math.floor(Math.random() * obstaclesMap.length);
    const randomColumn = Math.floor(Math.random() * obstaclesMap[0].length);

    if (obstaclesMap[randomRow][randomColumn] || consumablesMap[randomRow][randomColumn] || (randomRow === playerPosition.row && randomColumn === playerPosition.column)) {
      return this._getRandomPosition();
    }

    return { row: randomRow, column: randomColumn };
  }
}
