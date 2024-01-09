
import * as THREE from 'three';
import { ENEMY_STATE } from '../data/enemy-data';
import { GAME_CONFIG } from '../../data/game-config';
import ObjectPositionHelper from '../../helpers/object-position-helper';
import { GAME_OBJECT_TYPE, ROTATION_BY_DIRECTION } from '../../data/game-data';
import { MessageDispatcher } from 'black-engine';

export default class EnemyAbstract extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._viewGroup = null;
    this._currentPosition = null;
    this._currentDirection = null;
    this._positionHelper = null;
    this._arrowHelper = null;

    this._isBodyActive = false;

    this._state = ENEMY_STATE.Idle;
    this._type = null;
  }

  update(dt) { }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  setSpawnPosition() {}

  reset() {}

  stopTweens() {}

  setBodyActivity(activity) {
    this._isBodyActive = activity;
  }

  isBodyActive() {
    return this._isBodyActive;
  }

  getType() {
    return this._type;
  }

  setPosition(position) {
    this._currentPosition = position;

    const cellSize = GAME_CONFIG.cellSize;
    const fieldConfig = GAME_CONFIG.field;
    this._viewGroup.position.x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + this._currentPosition.column * cellSize;
    this._viewGroup.position.z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + this._currentPosition.row * cellSize;
  }

  getPosition() {
    return this._currentPosition;
  }

  getPositionFromView() {
    const cellSize = GAME_CONFIG.cellSize;
    const fieldConfig = GAME_CONFIG.field;
    const position = {
      row: Math.round((this._viewGroup.position.z + fieldConfig.rows * cellSize * 0.5 - cellSize * 0.5) / cellSize),
      column: Math.round((this._viewGroup.position.x + fieldConfig.columns * cellSize * 0.5 - cellSize * 0.5) / cellSize),
    };

    return position;
  }

  debugChangedHelper() {
    if (GAME_CONFIG.helpers && !this._positionHelper) {
      this._initHelpers();
    }

    this._positionHelper.debugChangedHelper();
    this._positionHelper.setPosition(this._currentPosition);
    this._arrowHelper.visible = GAME_CONFIG.helpers;
  }

  setDirection(direction) {
    this._currentDirection = direction;
    this._viewGroup.rotation.y = ROTATION_BY_DIRECTION[direction];
  }

  _initHelpers() {
    if (!GAME_CONFIG.helpers) {
      return;
    }

    this._initPositionHelper();
    this._initDirectionHelper();
  }

  _initPositionHelper() {
    const positionHelper = this._positionHelper = new ObjectPositionHelper(GAME_OBJECT_TYPE.Enemy);
    this.add(positionHelper);
  }

  _initDirectionHelper() {
    const arrowHelper = this._arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0xff0000);
    this._viewGroup.add(arrowHelper);
  }
}