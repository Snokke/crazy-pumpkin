import * as THREE from 'three';
import Player from './player/player';
import EnemiesController from './enemies/enemies-controller';
import { GAME_FIELD_CONFIG, GAME_OBJECT_TYPE, GAME_STATE_TYPE } from './data/game-field-config';
import { BUTTONS_CONFIG, BUTTON_TYPE } from './data/keyboard-config';
import ObstaclesController from './obstacle/obstacles-controller';
import { LEVEL_CONFIG, LEVEL_TYPE } from './data/level-config';
import { deepCopyArray } from '../../../core/helpers/helpers';
import { PLAYER_ACTIONS, PLAYER_ACTION_TO_DIRECTION, PLAYER_CONVERT_JUMP_IN_PLACE } from './player/data/player-data';
import ObjectPositionHelper from './helpers/object-position-helper';
import GameFieldView from './game-field-view';

export default class GameField extends THREE.Group {
  constructor() {
    super();

    this._player = null;
    this._enemiesController = null;
    this._obstaclesController = null;
    this._fieldView = null;

    this._playerActions = null;
    this._gameObjectsMap = null;
    this._gameState = GAME_STATE_TYPE.Idle;

    this._init();
  }

  update(dt) {
    this._player.update(dt);
  }

  initLevel(level) {
    this._removeLevelObjects();
    this._player.hide();

    this._gameState = GAME_STATE_TYPE.Idle;
    GAME_FIELD_CONFIG.currentLevel = level;

    this._fieldView.init(); 
    this._initPlayerForLevel();
    this._obstaclesController.createObstacles(level);

    this._initGameObjectsMap();
  }

  startGame() {
    this._gameState = GAME_STATE_TYPE.Active;
  }

  onHelpersChanged() {
    this._fieldView.debugChangedHelper();
    this._player.debugChangedHelper();
    this._playerPositionHelper.debugChangedHelper();
    this._playerPositionHelper.setPosition(this._player.getPosition());
    this._obstaclesController.debugChangedHelper();
  }

  _removeLevelObjects() {
    this._fieldView.removeObjects();
  }

  _initPlayerForLevel() {
    const playerConfig = LEVEL_CONFIG[GAME_FIELD_CONFIG.currentLevel].player;
    this._player.setPosition(playerConfig.startPosition);
    this._player.setDirection(playerConfig.direction);
    this._player.show();

    this._playerPositionHelper.setPosition(playerConfig.startPosition);
    this._playerPositionHelper.show();
  }

  _initGameObjectsMap() {
    this._gameObjectsMap = deepCopyArray(this._obstaclesController.getObstaclesMap());

    const playerPosition = this._player.getPosition();
    this._gameObjectsMap[playerPosition.row][playerPosition.column] = GAME_OBJECT_TYPE.Player;
  }

  _init() {
    this._initPlayer();
    this._initEnemiesController();
    this._initObstaclesController();
    this._initPlayerPositionHelper();
    this._initFiledView();
    this._initKeyboardEvents();

    this._initSignals();

    this.initLevel(LEVEL_TYPE.Level001);
    this.startGame();

    // setTimeout(() => {
    //   this.initLevel(LEVEL_TYPE.Level002);
    //   this.startGame();
    // }, 2000);
  }

  _initPlayer() {
    const player = this._player = new Player();
    this.add(player);

    this._playerActions = {
      [BUTTON_TYPE.Left]: PLAYER_ACTIONS.JumpLeft,
      [BUTTON_TYPE.Right]: PLAYER_ACTIONS.JumpRight,
      [BUTTON_TYPE.Up]: PLAYER_ACTIONS.JumpUp,
      [BUTTON_TYPE.Down]: PLAYER_ACTIONS.JumpDown,
      [BUTTON_TYPE.Jump]: PLAYER_ACTIONS.JumpInPlace,
    };
  }

  _initEnemiesController() {
    const enemiesController = this._enemiesController = new EnemiesController();
    this.add(enemiesController);
  }

  _initObstaclesController() {
    const obstaclesController = this._obstaclesController = new ObstaclesController();
    this.add(obstaclesController);
  }

  _initFiledView() {
    const fieldView = this._fieldView = new GameFieldView();
    this.add(fieldView);
  }

  _initPlayerPositionHelper() {
    const playerPositionHelper = this._playerPositionHelper = new ObjectPositionHelper(GAME_OBJECT_TYPE.Player);
    this.add(playerPositionHelper);
  }

  _initKeyboardEvents() {
    this._onPressDownSignal = this._onPressDownSignal.bind(this);

    window.addEventListener("keydown", this._onPressDownSignal);
  }

  _onPressDownSignal(e) {
    if (this._gameState !== GAME_STATE_TYPE.Active) {
      return;
    }

    for (const value in BUTTON_TYPE) {
      const buttonType = BUTTON_TYPE[value];
      const config = BUTTONS_CONFIG[buttonType];

      if (config.keyCode && config.keyCode.includes(e.code)) {
        this._onButtonPress(buttonType);
      }
    }
  }

  _onButtonPress(buttonType) {
    const action = this._playerActions[buttonType];

    if (action === PLAYER_ACTIONS.JumpInPlace) {
      this._player.startAction(action);
      return;
    }

    const isJumpValid = this._checkPlayerJumpValidity(action);
    const newAction = isJumpValid ? action : PLAYER_CONVERT_JUMP_IN_PLACE[action];

    this._player.startAction(newAction);
  }

  _checkPlayerJumpValidity(action) {
    const currentLevel = GAME_FIELD_CONFIG.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const direction = PLAYER_ACTION_TO_DIRECTION[action];
    const newPosition = this._player.getNewPosition(direction);

    if (newPosition.row < 0 || newPosition.row >= fieldConfig.rows || newPosition.column < 0 || newPosition.column >= fieldConfig.columns) {
      return false;
    }

    const gameObject = this._gameObjectsMap[newPosition.row][newPosition.column];

    if (gameObject === GAME_OBJECT_TYPE.Obstacle) {
      return false;
    }

    return true;
  }

  _initSignals() {
    this._player.events.on('positionChanged', (msg, newPosition, previousPosition) => this._onPlayerPositionChanged(newPosition, previousPosition));
  }

  _onPlayerPositionChanged(newPosition, previousPosition) {
    if (this._gameState !== GAME_STATE_TYPE.Active) {
      return;
    }

    this._playerPositionHelper.setPosition(newPosition);

    this._gameObjectsMap[previousPosition.row][previousPosition.column] = null;
    this._gameObjectsMap[newPosition.row][newPosition.column] = GAME_OBJECT_TYPE.Player;
  }
}