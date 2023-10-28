import * as THREE from 'three';
import Obstacle from './obstacle';
import { GAME_CONFIG } from '../data/game-config';
import { LEVEL_CONFIG } from '../data/level-config';
import ObjectPositionHelper from '../helpers/object-position-helper';
import { GAME_OBJECT_TYPE, MAP_TYPE } from '../data/game-data';
import Delayed from '../../../../core/helpers/delayed-call';
import { randomBetween, randomFromArray } from '../../../../core/helpers/helpers';
import { OBSTACLE_TYPE } from './data/obstacles-config';
import { GLOBAL_VARIABLES } from '../data/global-variables';

export default class ObstaclesController extends THREE.Group {
  constructor() {
    super();

    this._obstacles = [];
    this._positionHelpers = [];
  }

  createObstacles() {
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const obstaclesConfig = LEVEL_CONFIG[currentLevel].obstacles;
    this._createObstacles(obstaclesConfig);
    this._createPositionsHelper();
    this._initMap();
  }

  showIntro() {
    let delay = 0;
    const delayStep = 80;

    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];

    for (let row = 0; row < obstacleMap.length; row++) {
      for (let column = 0; column < obstacleMap[0].length; column++) {
        if (obstacleMap[row][column]) {
          const obstacle = this._getObstacleByPosition({ row, column });
          obstacle.show();
          obstacle.showIntro(delay);
          delay += delayStep;
        }
      }
    }

    return Delayed.call(delay + delayStep * 1.5, () => {});
  }

  debugChangedHelper() {
    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];
      const positionHelper = this._positionHelpers[i];
      positionHelper.debugChangedHelper();
      positionHelper.setPosition(obstacle.getPosition());
    }
  }

  reset() {
    this._obstacles.forEach(obstacle => this.remove(obstacle));
    this._obstacles = [];

    this._positionHelpers.forEach(positionHelper => this.remove(positionHelper));
    this._positionHelpers = [];
  }

  _getObstacleByPosition(position) {
    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];

      if (obstacle.getPosition().row === position.row && obstacle.getPosition().column === position.column) {
        return obstacle;
      }
    }

    return null;
  }

  _initMap() {
    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];

    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];
      const position = obstacle.getPosition();

      obstacleMap[position.row][position.column] = obstacle;
    }
  }

  _createObstacles(obstaclesConfig) {
    const config = obstaclesConfig.randomMap ? this._getObstaclesRandomConfig(obstaclesConfig) : obstaclesConfig.map;
    this._createObstaclesByMap(config);
  }

  _getObstaclesRandomConfig(obstaclesConfig) {
    const count = randomBetween(obstaclesConfig.count.min, obstaclesConfig.count.max);
    const fieldConfig = LEVEL_CONFIG[GLOBAL_VARIABLES.currentLevel].field;
    const randomPositions = [];
    const randomObstaclesConfig = [];
    const types = [OBSTACLE_TYPE.Tree, OBSTACLE_TYPE.Rock];

    for (let i = 0; i < count; i++) {
      let position = null;

      do {
        position = {
          row: randomBetween(0, fieldConfig.rows - 1),
          column: randomBetween(0, fieldConfig.columns - 1),
        };
      } while (randomPositions.find(randomPosition => randomPosition.row === position.row && randomPosition.column === position.column) || obstaclesConfig.ignorePositions.find(ignorePosition => ignorePosition.row === position.row && ignorePosition.column === position.column));

      randomPositions.push(position);
      randomObstaclesConfig.push({
        type: randomFromArray(types),
        position,
      });
    }

    return randomObstaclesConfig;
  }

  _createObstaclesByMap(obstaclesConfig) {
    for (let i = 0; i < obstaclesConfig.length; i++) {
      const config = obstaclesConfig[i];

      const obstacle = new Obstacle(config.type);
      this.add(obstacle);

      obstacle.setPosition(config.position);
      obstacle.hide();
      this._obstacles.push(obstacle);
    }
  }

  _createPositionsHelper() {
    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];

      const obstaclePositionHelper = new ObjectPositionHelper(GAME_OBJECT_TYPE.Obstacle);
      this.add(obstaclePositionHelper);

      obstaclePositionHelper.setPosition(obstacle.getPosition());
      obstaclePositionHelper.show();

      this._positionHelpers.push(obstaclePositionHelper);
    }
  }
}