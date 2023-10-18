import * as THREE from 'three';
import Obstacle from './obstacle';
import { GAME_FIELD_CONFIG, GAME_OBJECT_TYPE } from '../data/game-field-config';
import { LEVEL_CONFIG } from '../data/level-config';
import ObjectPositionHelper from '../helpers/object-position-helper';

export default class ObstaclesController extends THREE.Group {
  constructor() {
    super();

    this._obstacles = [];
    this._positionHelpers = [];
    this._obstaclesMap = null;
  }

  createObstacles(level) {
    this._removeAllObjects();

    const obstaclesConfig = LEVEL_CONFIG[level].obstacles;
    this._createObstacles(obstaclesConfig);
    this._createPositionsHelper();
    this._initMap();
  }

  getObstaclesMap() {
    return this._obstaclesMap;
  }

  debugChangedHelper() {
    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];
      const positionHelper = this._positionHelpers[i];
      positionHelper.debugChangedHelper();
      positionHelper.setPosition(obstacle.getPosition());
    }
  }

  _initMap() {
    this._obstaclesMap = [];
    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;

    for (let row = 0; row < fieldConfig.rows; row++) {
      this._obstaclesMap.push([]);

      for (let column = 0; column < fieldConfig.columns; column++) {
        this._obstaclesMap[row].push(null);
      }
    }

    for (let i = 0; i < this._obstacles.length; i++) {
      const obstacle = this._obstacles[i];
      const position = obstacle.getPosition();

      this._obstaclesMap[position.row][position.column] = GAME_OBJECT_TYPE.Obstacle;
    }
  }

  _createObstacles(obstaclesConfig) {
    for (let i = 0; i < obstaclesConfig.length; i++) {
      const config = obstaclesConfig[i];

      const obstacle = new Obstacle(config.type);
      this.add(obstacle);

      obstacle.setPosition(config.position);
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

  _removeAllObjects() {
    this._obstacles.forEach(obstacle => this.remove(obstacle));
    this._obstacles = [];

    this._positionHelpers.forEach(positionHelper => this.remove(positionHelper));
    this._positionHelpers = [];
  }
}