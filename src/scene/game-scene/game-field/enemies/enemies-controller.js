import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { ENEMY_TYPE } from './data/enemy-data';
import ENEMY_CLASS from './data/enemy-class';
import { MessageDispatcher } from 'black-engine';
import { GAME_STATE } from '../data/game-data';
import { GHOSTS_COLOR_BY_TYPE, GHOST_CONFIG } from './data/ghost-config';
import Delayed from '../../../../core/helpers/delayed-call';
import { randomBetween, randomFromArray } from '../../../../core/helpers/helpers';
import { GLOBAL_VARIABLES } from '../data/global-variables';
import { EVIL_PUMPKIN_CONFIG } from './data/evil-pumpkin-config';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from '../consumables/data/consumables-config';
import { SKELETON_CONFIG } from './data/skeleton-config';
import { ROUNDS_CONFIG } from '../data/rounds-config';

export default class EnemiesController extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._enemiesPool = {};
    this._activeEnemies = {};
    this._ghostSpawnTimer = null;
    this._enemiesSlowBoosterTimer = null;

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
    this._ghostSpawn();
    this._spawnFirstEvilPumpkin();
    this._spawnSkeleton();
  }

  stopTweens() {
    this._iterateActiveEnemies((enemy) => enemy.stopTweens());
  }

  reset() {
    this._removeAllEnemies();
    this._ghostSpawnTimer?.stop();
    this._enemiesSlowBoosterTimer?.stop();
    this._updateSpeedMultiplier();
  }

  debugChangedHelper() {
    this._iterateActiveEnemies((enemy) => {
      enemy.debugChangedHelper();
    });
  }

  onRoundChanged() {
    this._updateGhostOnRoundChanged();
    this._updateEvilPumpkinOnRoundChanged();
    this._updateSkeletonOnRoundChanged();
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

  stopEnemiesSlowBooster() {
    this._enemiesSlowBoosterTimer?.stop();
    this._updateSpeedMultiplier();
  }  

  startEnemiesSlowBooster() {
    const boosterConfig = CONSUMABLES_CONFIG[CONSUMABLE_TYPE.BoosterCandyEnemiesSlow];
    GHOST_CONFIG.speedMultiplier = boosterConfig.speedMultiplier;
    EVIL_PUMPKIN_CONFIG.speedMultiplier = boosterConfig.speedMultiplier;
    SKELETON_CONFIG.speedMultiplier = boosterConfig.speedMultiplier;

    this._iterateActiveEnemies((enemy) => {
      if (enemy.getType() === ENEMY_TYPE.EvilPumpkin) {
        enemy.updateJumpTime();
      }

      if (enemy.getType() === ENEMY_TYPE.Skeleton) {
        enemy.updateSpeedMultiplier();
      }
    });

    this._iteratePoolEnemies((enemy) => {
      if (enemy.getType() === ENEMY_TYPE.EvilPumpkin) {
        enemy.updateJumpTime();
      }

      if (enemy.getType() === ENEMY_TYPE.Skeleton) {
        enemy.updateSpeedMultiplier();
      }
    });

    this._enemiesSlowBoosterTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, boosterConfig.duration)
      .start()
      .onComplete(() => {
        this._updateSpeedMultiplier();
        GLOBAL_VARIABLES.activeBooster = null;
      });
  }

  changeGhostsColor() {
    const activeGhosts = this._activeEnemies[ENEMY_TYPE.Ghost];
    const inactiveGhosts = this._enemiesPool[ENEMY_TYPE.Ghost];
    const allGhosts = [...activeGhosts, ...inactiveGhosts];
    const ghostColors = GHOSTS_COLOR_BY_TYPE[GLOBAL_VARIABLES.ghostsColorType];

    allGhosts.forEach((ghost) => {
      if (ghostColors.length === 1) {
        ghost.setColorType(ghostColors[0]);
      } else {
        const randomColor = randomFromArray(ghostColors);
        ghost.setColorType(randomColor);
      }
    });
  }

  _updateSpeedMultiplier() {
    const round = GLOBAL_VARIABLES.round;
    const ghostRoundConfig = ROUNDS_CONFIG.enemies[ENEMY_TYPE.Ghost][round];
    const evilPumpkinRoundConfig = ROUNDS_CONFIG.enemies[ENEMY_TYPE.EvilPumpkin][round];
    const skeletonRoundConfig = ROUNDS_CONFIG.enemies[ENEMY_TYPE.Skeleton][round];

    GHOST_CONFIG.speedMultiplier = ghostRoundConfig.speedMultiplier;
    EVIL_PUMPKIN_CONFIG.speedMultiplier = evilPumpkinRoundConfig.speedMultiplier;
    SKELETON_CONFIG.speedMultiplier = skeletonRoundConfig.speedMultiplier;

    this._iterateActiveEnemies((enemy) => {
      if (enemy.getType() === ENEMY_TYPE.EvilPumpkin) {
        enemy.updateJumpTime();
      }

      if (enemy.getType() === ENEMY_TYPE.Skeleton) {
        enemy.updateSpeedMultiplier();
      }
    });

    this._iteratePoolEnemies((enemy) => {
      if (enemy.getType() === ENEMY_TYPE.EvilPumpkin) {
        enemy.updateJumpTime();
      }

      if (enemy.getType() === ENEMY_TYPE.Skeleton) {
        enemy.updateSpeedMultiplier();
      }
    });
  }

  _updateGhostOnRoundChanged() {
    const round = GLOBAL_VARIABLES.round;
    const ghostRoundConfig = ROUNDS_CONFIG.enemies[ENEMY_TYPE.Ghost][round];

    if (!GLOBAL_VARIABLES.activeBooster) {
      GHOST_CONFIG.speedMultiplier = ghostRoundConfig.speedMultiplier;
    }

    const currentGhostCount = this._activeEnemies[ENEMY_TYPE.Ghost].length;
    const spawnCount = ghostRoundConfig.maxCount - currentGhostCount;

    if (spawnCount < 0) {
      const removeCount = Math.abs(spawnCount);

      for (let i = 0; i < removeCount; i++) {
        const enemy = this._activeEnemies[ENEMY_TYPE.Ghost][i];
        enemy.kill();
      }
    }
  }

  _updateEvilPumpkinOnRoundChanged() {
    if (!GLOBAL_VARIABLES.activeBooster) {
      this._updateEvilPumpkinSpeedMultiplier();
    }

    if (GLOBAL_VARIABLES.gameState === GAME_STATE.Gameplay) {
      this._evilPumpkinSpawn();
    }
  }

  _updateSkeletonOnRoundChanged() {
    const round = GLOBAL_VARIABLES.round;
    const skeletonRoundConfig = ROUNDS_CONFIG.enemies[ENEMY_TYPE.Skeleton][round];

    if (!GLOBAL_VARIABLES.activeBooster) {
      SKELETON_CONFIG.speedMultiplier = skeletonRoundConfig.speedMultiplier;

      this._iterateActiveEnemies((enemy) => {
        if (enemy.getType() === ENEMY_TYPE.Skeleton) {
          enemy.updateSpeedMultiplier();
        }
      });
  
      this._iteratePoolEnemies((enemy) => {
        if (enemy.getType() === ENEMY_TYPE.Skeleton) {
          enemy.updateSpeedMultiplier();
        }
      });
    }
  }

  _updateEvilPumpkinSpeedMultiplier() {
    const round = GLOBAL_VARIABLES.round;
    const evilPumpkinRoundConfig = ROUNDS_CONFIG.enemies[ENEMY_TYPE.EvilPumpkin][round];

    EVIL_PUMPKIN_CONFIG.speedMultiplier = evilPumpkinRoundConfig.speedMultiplier;

    this._iterateActiveEnemies((enemy) => {
      if (enemy.getType() === ENEMY_TYPE.EvilPumpkin) {
        enemy.updateJumpTime();
      }
    });

    this._iteratePoolEnemies((enemy) => {
      if (enemy.getType() === ENEMY_TYPE.EvilPumpkin) {
        enemy.updateJumpTime();
      }
    });
  }

  _spawnFirstEvilPumpkin() {
    Delayed.call(2000, () => {
      this._spawnEnemy(ENEMY_TYPE.EvilPumpkin);
      this._evilPumpkinSpawn();
    });
  }

  _spawnSkeleton() {
    this._spawnEnemy(ENEMY_TYPE.Skeleton);
  }

  _ghostSpawn() {
    const spawnTime = randomBetween(GHOST_CONFIG.spawnTime.min, GHOST_CONFIG.spawnTime.max);

    this._ghostSpawnTimer = new TWEEN.Tween({ value: 0 })
      .to({ value: 1 }, spawnTime)
      .start()
      .onComplete(() => {
        if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
          return;
        }
  
        const round = GLOBAL_VARIABLES.round;
        const ghostRoundConfig = ROUNDS_CONFIG.enemies[ENEMY_TYPE.Ghost][round];
        const maxCount = ghostRoundConfig.maxCount;
  
        if (this._activeEnemies[ENEMY_TYPE.Ghost].length < maxCount) {
          this._spawnEnemy(ENEMY_TYPE.Ghost);
        }
  
        this._ghostSpawn();
      });
  }

  _evilPumpkinSpawn() {
    const round = GLOBAL_VARIABLES.round;
    const evilPumpkinRoundConfig = ROUNDS_CONFIG.enemies[ENEMY_TYPE.EvilPumpkin][round];
    const currentCount = this._activeEnemies[ENEMY_TYPE.EvilPumpkin].length;

    const spawnCount = evilPumpkinRoundConfig.count - currentCount;

    if (spawnCount < 0) {
      const removeCount = Math.abs(spawnCount);

      for (let i = 0; i < removeCount; i++) {
        const enemy = this._activeEnemies[ENEMY_TYPE.EvilPumpkin][i];
        enemy.kill();
      }

      return;
    }

    for (let i = 0; i < spawnCount; i++) {
      this._spawnEnemy(ENEMY_TYPE.EvilPumpkin);
    }
  }

  _removeAllEnemies() {
    this._removeEnemiesByType(ENEMY_TYPE.Ghost);
    this._removeEnemiesByType(ENEMY_TYPE.EvilPumpkin);
    this._removeEnemiesByType(ENEMY_TYPE.Skeleton);
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
      const enemy = this._createEnemy(type);
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
    enemy.events.on('positionChanged', () => this.events.post('positionChanged'));
    enemy.events.on('onKilled', (msg, enemyToKill) => this._removeEnemy(enemyToKill));
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
