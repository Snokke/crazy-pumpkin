import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import CONSUMABLE_CLASS from './data/consumables-class';
import { GAME_STATE, MAP_TYPE } from '../data/game-data';
import { CONSUMABLE_TYPE, CONSUMABLES_CONFIG } from './data/consumables-config';
import { randomBetween, randomFromArray } from '../../../../core/helpers/helpers';
import { GLOBAL_VARIABLES } from '../data/global-variables';

export default class ConsumablesController extends THREE.Group {
  constructor() {
    super();

    this._consumablesPool = [];
    this._activeConsumables = [];

    this._spawnTimer = {};
    this._spawnBoosterTimer = null;
  }

  update(dt) {
    this._activeConsumables.forEach(consumable => consumable.update(dt));
    this._consumablesPool.forEach(consumable => consumable.update(dt));
  }

  activateSpawnConsumables() {
    this._spawnCandy(CONSUMABLE_TYPE.BigCandy);
    this._spawnCandy(CONSUMABLE_TYPE.SmallCandy);
    this._spawnBoosterCandy();
  }

  removeConsumable(consumable, hideAnimation) {
    const consumableMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable];
    const position = consumable.getPosition();
    consumableMap[position.row][position.column] = null;

    const consumableType = consumable.getType();

    if (consumableType === CONSUMABLE_TYPE.BoosterCandyEnemiesSlow || consumableType === CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability || consumableType === CONSUMABLE_TYPE.BoosterCandyPlayerSpeed) {
      GLOBAL_VARIABLES.boosterSpawned = false;
    }
    
    this._activeConsumables.splice(this._activeConsumables.indexOf(consumable), 1);
    this._consumablesPool.push(consumable);

    consumable.kill(hideAnimation);
  }

  reset() {
    this._activeConsumables.forEach(consumable => consumable.kill(false));

    for (const key in this._spawnTimer) {
      if (this._spawnTimer.hasOwnProperty(key)) {
        const spawnTimer = this._spawnTimer[key];
        spawnTimer?.stop();
      }
    }

    this._spawnBoosterTimer?.stop();
  }

  stopTweens() {
    this._activeConsumables.forEach(consumable => consumable.stopTweens());
  }

  _spawnCandy(type) {
    const config = CONSUMABLES_CONFIG[type];
    const spawnTime = randomBetween(config.spawnTime.min, config.spawnTime.max);

    this._spawnTimer[type] = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, spawnTime)
      .start()
      .onComplete(() => {
        if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
          return;
        }
  
        const chanceToSpawn = Math.random();
  
        if (chanceToSpawn > config.chanceToSpawn) {
          this._spawnCandy(type);
          return;
        }
  
        this._spawnConsumable(type);
        this._spawnCandy(type);
      });
  }

  _spawnBoosterCandy() {
    const config = CONSUMABLES_CONFIG.boosterCandyConfig;
    const spawnTime = randomBetween(config.spawnTime.min, config.spawnTime.max);

    this._spawnBoosterTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, spawnTime)
      .start()
      .onComplete(() => {
        if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
          return;
        }
  
        const chanceToSpawn = Math.random();
  
        if (chanceToSpawn > config.chanceToSpawn || GLOBAL_VARIABLES.activeBooster || GLOBAL_VARIABLES.boosterSpawned) {
          this._spawnBoosterCandy();
          return;
        }

        const boosterCandyTypes = [
          CONSUMABLE_TYPE.BoosterCandyPlayerSpeed,
          CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability,
          CONSUMABLE_TYPE.BoosterCandyEnemiesSlow,
        ];

        const randomType = randomFromArray(boosterCandyTypes);
  
        GLOBAL_VARIABLES.boosterSpawned = true;
        this._spawnConsumable(randomType);
        this._spawnBoosterCandy();
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
