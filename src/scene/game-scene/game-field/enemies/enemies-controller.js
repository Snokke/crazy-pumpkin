import * as THREE from 'three';
import { ENEMY_TYPE } from './data/enemy-data';
import ENEMY_CLASS from './data/enemy-class';
import { MessageDispatcher } from 'black-engine';
import { GAME_CONFIG } from '../data/game-config';
import { GAME_STATE } from '../data/game-data';
import { GHOST_CONFIG } from './data/ghost-config';
import Delayed from '../../../../core/helpers/delayed-call';
import { randomBetween } from '../../../../core/helpers/helpers';
import { GLOBAL_VARIABLES } from '../data/global-variables';

export default class EnemiesController extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._enemiesPool = {};
    this._activeEnemies = {};

    this._initEnemiesObjects();
  }

  update(dt) {
    if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    this._iterateActiveEnemies((enemy) => {
      enemy.update(dt);
    });
  }

  activateSpawnEnemies() {
    this._ghostsSpawnHandler();
  }

  stopTweens() {
    this._iterateActiveEnemies((enemy) => enemy.stopTweens());
  }

  reset() {
    this._removeAllEnemies();
  }

  debugChangedHelper() {
    this._iterateActiveEnemies((enemy) => {
      enemy.debugChangedHelper();
    });
  }

  getActiveEnemiesPositions() {
    const positions = [];

    this._iterateActiveEnemies((enemy) => {
      if (enemy.isBodyActive()) {
        positions.push(enemy.getPosition());
      }
    });

    return positions;
  }

  _ghostsSpawnHandler() {
    this._ghostSpawn();
  }

  _ghostSpawn() {
    const spawnTime = randomBetween(GHOST_CONFIG.spawnTime.min, GHOST_CONFIG.spawnTime.max);

    Delayed.call(spawnTime, () => {
      if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
        return;
      }

      if (this._activeEnemies[ENEMY_TYPE.Ghost].length < GHOST_CONFIG.maxCount) {
        this._spawnEnemy(ENEMY_TYPE.Ghost);
      }

      this._ghostSpawn();
    });
  }

  _removeAllEnemies() {
    this._removeEnemiesByType(ENEMY_TYPE.Ghost);
    this._resetPoolEnemies();
  }

  _removeEnemiesByType(type) {
    const enemies = this._activeEnemies[type];

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      enemy.hide();
      enemy.reset();
      this._enemiesPool[type].push(enemy);
    }

    this._activeEnemies[type] = [];
  }

  _resetPoolEnemies() {
    this._iteratePoolEnemies((enemy) => {
      enemy.reset();
    });
  }

  _removeEnemy(enemy) {
    const type = enemy.getType();
    const index = this._findActiveEnemyIndex(enemy);
    this._activeEnemies[type].splice(index, 1);
    this._enemiesPool[type].push(enemy);
  }

  _spawnEnemy(type) {
    const enemy = this._getEnemyFromPool(type);
    enemy.setSpawnPosition();
    enemy.spawn();

    this._activeEnemies[type].push(enemy);

    return enemy;
  }

  _getEnemyFromPool(type) {
    if (this._enemiesPool[type].length === 0) {
      const enemy = this._createEnemy(ENEMY_TYPE.Ghost)
      return enemy;
    }

    const enemy = this._enemiesPool[type].pop();

    return enemy;
  }

  _createEnemy(type) {
    const className = ENEMY_CLASS[type];
    const enemy = new className();
    this.add(enemy);

    this._initEnemySignals(enemy);

    return enemy;
  }

  _initEnemySignals(enemy) {
    enemy.events.on('positionChanged', (msg, newPosition, previousPosition) => this.events.post('positionChanged', newPosition, previousPosition));
    enemy.events.on('onKilled', (msg, enemyToKill) => this._removeEnemy(enemyToKill));
    enemy.events.on('onRemoveFromMap', (msg, position) => this.events.post('onRemoveFromMap', position));
  }

  _initEnemiesObjects() {
    for (const key in ENEMY_TYPE) {
      const enemyType = ENEMY_TYPE[key];
      this._enemiesPool[enemyType] = [];
      this._activeEnemies[enemyType] = [];
    }
  }

  _iterateActiveEnemies(callback) {
    for (const key in this._activeEnemies) {
      const enemies = this._activeEnemies[key];
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        callback(enemy);
      }
    }
  }

  _iteratePoolEnemies(callback) {
    for (const key in this._enemiesPool) {
      const enemies = this._enemiesPool[key];
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        callback(enemy);
      }
    }
  }

  _findActiveEnemyIndex(enemy) {
    const enemyType = enemy.getType();

    for (let i = 0; i < this._activeEnemies[enemyType].length; i++) {
      const activeEnemy = this._activeEnemies[enemyType][i];
      if (activeEnemy === enemy) {
        return i;
      }
    }
  }
}
