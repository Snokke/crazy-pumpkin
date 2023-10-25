import * as THREE from 'three';
import Player from './player/player';
import EnemiesController from './enemies/enemies-controller';
import { BUTTONS_CONFIG, BUTTON_TYPE } from './data/keyboard-config';
import ObstaclesController from './obstacles/obstacles-controller';
import { LEVEL_CONFIG, LEVEL_TYPE } from './data/level-config';
import { deepCopyArray } from '../../../core/helpers/helpers';
import { PLAYER_ACTIONS, PLAYER_ACTION_TO_DIRECTION, PLAYER_CONVERT_JUMP_IN_PLACE } from './player/data/player-data';
import ObjectPositionHelper from './helpers/object-position-helper';
import Board from './board/board';
import { GAME_OBJECT_TYPE, GAME_STATE, MAP_TYPE } from './data/game-data';
import { GAME_CONFIG } from './data/game-config';
import { MessageDispatcher } from 'black-engine';
import { SCORE_CONFIG } from './data/score-config';
import ConsumablesController from './consumables/consumables-controller';
import { GLOBAL_VARIABLES } from './data/global-variables';

export default class GameField extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._player = null;
    this._enemiesController = null;
    this._obstaclesController = null;
    this._consumablesController = null;
    this._board = null;

    this._playerActions = null;
    this._gameObjectsMap = null;

    this._consumablesMap = null;

    this._score = 0;
    this._previousGameTime = 0;
    this._gameTime = 0;

    this._init();
  }

  update(dt) {
    this._player.update(dt);
    this._enemiesController.update(dt);
    this._updateGameTime(dt);
  }

  initLevel(level) {
    this._resetLevel();

    GLOBAL_VARIABLES.gameState = GAME_STATE.Idle;
    GLOBAL_VARIABLES.currentLevel = level;

    this._board.init(); 
    this._initPlayerForLevel();

    this._initMaps();
    this._obstaclesController.createObstacles();
    this._initGameObjectsMap();
  }

  startGame() {
    this._obstaclesController.showIntro().on('complete', () => {
      this._player.showIntro();
    });
  }

  _startGameplay() {
    GLOBAL_VARIABLES.gameState = GAME_STATE.Gameplay;
    this._enemiesController.activateSpawnEnemies();
    this._consumablesController.activateSpawnConsumables();
    this.events.post('gameplayStarted');
  }

  restartGame() {
    this.initLevel(LEVEL_TYPE.Level001);
    this.startGame();
  }

  onHelpersChanged() {
    this._board.debugChangedHelper();
    this._player.debugChangedHelper();
    this._playerPositionHelper.debugChangedHelper();
    this._playerPositionHelper.setPosition(this._player.getPosition());
    this._obstaclesController.debugChangedHelper();
    this._enemiesController.debugChangedHelper();
  }

  _initPlayerForLevel() {
    const playerConfig = LEVEL_CONFIG[GLOBAL_VARIABLES.currentLevel].player;
    this._player.setPosition(playerConfig.startPosition);
    this._player.setDirection(playerConfig.direction);

    if (GAME_CONFIG.helpers) {
      this._playerPositionHelper.setPosition(playerConfig.startPosition);
      this._playerPositionHelper.show();
    }
  }

  _initGameObjectsMap() {
    this._gameObjectsMap = deepCopyArray(this._obstaclesController.getObstaclesMap());

    const playerPosition = this._player.getPosition();
    this._gameObjectsMap[playerPosition.row][playerPosition.column] = GAME_OBJECT_TYPE.Player;
  }

  _resetLevel() {
    this._player.hide();
    this._player.reset();
    this._board.reset();
    this._enemiesController.reset();
    this._obstaclesController.reset();
    this._consumablesController.reset();

    this._resetGameTime();
    this._setScore(0);
  }

  _updateGameTime(dt) {
    if (GLOBAL_VARIABLES.gameState === GAME_STATE.Gameplay) {
      this._gameTime += dt;

      if (this._gameTime - this._previousGameTime > 1) {
        this._previousGameTime = this._gameTime;
        this._addScore(SCORE_CONFIG.perSecond);
      }
    }
  }

  _addScore(score) {
    this._score += score;
    this.events.post('scoreChanged', this._score);
  }

  _setScore(score) {
    this._score = score;
    this.events.post('scoreChanged', this._score);
  }

  _resetGameTime() {
    this._previousGameTime = 0;
    this._gameTime = 0;
  }

  _init() {
    this._initPlayer();
    this._initEnemiesController();
    this._initObstaclesController();
    this._initConsumablesController();
    this._initPlayerPositionHelper();
    this._initBoard();
    this._initKeyboardEvents();

    this._initSignals();

    this.initLevel(LEVEL_TYPE.Level001);
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

  _initConsumablesController() {
    const consumablesController = this._consumablesController = new ConsumablesController();
    this.add(consumablesController);
  }

  _initBoard() {
    const board = this._board = new Board();
    this.add(board);
  }

  _initMaps() {
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const consumableMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable] = [];
    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle] = [];

    for (let row = 0; row < fieldConfig.rows; row++) {
      consumableMap.push([]);
      obstacleMap.push([]);

      for (let column = 0; column < fieldConfig.columns; column++) {
        consumableMap[row].push(null);
        obstacleMap[row].push(null);
      }
    }
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
    if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
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
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
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

  _onLose() {
    GLOBAL_VARIABLES.gameState = GAME_STATE.GameOver;
    this._enemiesController.stopTweens();
    this._consumablesController.stopTweens();
    this.events.post('gameOver');
  }

  _initSignals() {
    this._player.events.on('positionChanged', (msg, newPosition, previousPosition) => this._onPlayerPositionChanged(newPosition, previousPosition));
    this._player.events.on('introFinished', () => this._startGameplay());
    this._enemiesController.events.on('positionChanged', (msg, newPosition, previousPosition) => this._onEnemyPositionChanged(newPosition, previousPosition));
    this._enemiesController.events.on('onRemoveFromMap', (msg, position) => this._onEnemyKilled(position));
  }

  _onPlayerPositionChanged(newPosition, previousPosition) {
    if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    this._playerPositionHelper.setPosition(newPosition);

    this._gameObjectsMap[previousPosition.row][previousPosition.column] = null;

    if (this._gameObjectsMap[newPosition.row][newPosition.column] === GAME_OBJECT_TYPE.Enemy) {
      this._onLose();
      return;
    }

    const consumablesMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable];
    const consumable = consumablesMap[newPosition.row][newPosition.column];

    if (consumable) {
      const consumableType = consumable.getType();
      const score = SCORE_CONFIG.consumables[consumableType];
      this._addScore(score);
      this._consumablesController.removeConsumable(consumable, false);
    }

    this._gameObjectsMap[newPosition.row][newPosition.column] = GAME_OBJECT_TYPE.Player;
  }

  _onEnemyPositionChanged(newPosition, previousPosition) {
    if (previousPosition && this._gameObjectsMap[previousPosition.row][previousPosition.column] !== GAME_OBJECT_TYPE.Obstacle) {
      this._gameObjectsMap[previousPosition.row][previousPosition.column] = null;
    }

    if (this._gameObjectsMap[newPosition.row][newPosition.column] === GAME_OBJECT_TYPE.Obstacle) {
      return;
    }

    if (this._gameObjectsMap[newPosition.row][newPosition.column] === GAME_OBJECT_TYPE.Player) {
      this._onLose();
      return;
    }

    this._gameObjectsMap[newPosition.row][newPosition.column] = GAME_OBJECT_TYPE.Enemy;
  }

  _onEnemyKilled(position) {
    this._gameObjectsMap[position.row][position.column] = null;

    this._updateEnemiesMap();
    this._updateObstaclesMap();
  }

  _updateEnemiesMap() {
    const enemiesPositions = this._enemiesController.getActiveEnemiesPositions();

    for (let i = 0; i < enemiesPositions.length; i++) {
      const position = enemiesPositions[i];
      this._gameObjectsMap[position.row][position.column] = GAME_OBJECT_TYPE.Enemy;
    }
  }

  _updateObstaclesMap() {
    const obstaclesMap = this._obstaclesController.getObstaclesMap();

    for (let row = 0; row < obstaclesMap.length; row++) {
      for (let column = 0; column < obstaclesMap[row].length; column++) {
        if (obstaclesMap[row][column] === GAME_OBJECT_TYPE.Obstacle) {
          this._gameObjectsMap[row][column] = GAME_OBJECT_TYPE.Obstacle;
        }
      }
    }
  }
}
