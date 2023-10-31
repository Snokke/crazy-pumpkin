import * as THREE from 'three';
import Player from './player/player';
import EnemiesController from './enemies/enemies-controller';
import { BUTTONS_CONFIG, BUTTON_TYPE } from './data/keyboard-config';
import ObstaclesController from './obstacles/obstacles-controller';
import { LEVEL_CONFIG, LEVEL_TYPE } from './data/level-config';
import { PLAYER_ACTIONS, PLAYER_ACTION_TO_DIRECTION, PLAYER_CONVERT_JUMP_IN_PLACE } from './player/data/player-data';
import ObjectPositionHelper from './helpers/object-position-helper';
import Board from './board/board';
import { GAME_OBJECT_TYPE, GAME_STATE, MAP_TYPE } from './data/game-data';
import { GAME_CONFIG, ROUND_CONFIG } from './data/game-config';
import { MessageDispatcher } from 'black-engine';
import { SCORE_CONFIG } from './data/score-config';
import ConsumablesController from './consumables/consumables-controller';
import { GLOBAL_VARIABLES } from './data/global-variables';
import { vector3ToBlackPosition } from '../../../core/helpers/helpers';
import { CONSUMABLE_TYPE } from './consumables/data/consumables-config';
import SimpleBoard from './board/simple-board';

export default class GameField extends THREE.Group {
  constructor(renderer, camera) {
    super();

    this.events = new MessageDispatcher();

    this._renderer = renderer;
    this._camera = camera;

    this._player = null;
    this._enemiesController = null;
    this._obstaclesController = null;
    this._consumablesController = null;
    this._board = null;
    this._simpleBoard = null;

    this._playerActions = null;

    this._score = 0;
    this._previousGameTime = 0;
    this._gameTime = 0;
    this._roundTime = 0;

    this._init();
  }

  update(dt) {
    this._player.update(dt);
    this._enemiesController.update(dt);
    this._updateGameTime(dt);
    this._updateRoundTime(dt);
  }

  initLevel(level) {
    this._resetLevel();

    GLOBAL_VARIABLES.gameState = GAME_STATE.Idle;
    GLOBAL_VARIABLES.currentLevel = level;
    GLOBAL_VARIABLES.round = 0;
    this.events.post('roundUp');

    // this._board.init(); 
    this._initPlayerForLevel();

    this._initMaps();
    this._obstaclesController.createObstacles();
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
    // this._board.debugChangedHelper();
    this._player.debugChangedHelper();
    this._playerPositionHelper.debugChangedHelper();
    this._playerPositionHelper.setPosition(this._player.getPosition());
    this._obstaclesController.debugChangedHelper();
    this._enemiesController.debugChangedHelper();
  }

  _roundUp() {
    if (GLOBAL_VARIABLES.round >= ROUND_CONFIG.maxRound) {
      return;
    }
    
    GLOBAL_VARIABLES.round++;
    this.events.post('roundUp');
  }

  onRoundChanged() {
    this._player.onRoundChanged();
    this._enemiesController.onRoundChanged();
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

  _resetLevel() {
    this._player.hide();
    this._player.reset();
    // this._board.reset();
    this._enemiesController.reset();
    this._obstaclesController.reset();
    this._consumablesController.reset();

    GLOBAL_VARIABLES.boosterSpawned = false;
    GLOBAL_VARIABLES.activeBooster = null;
    this._roundTime = 0;
    this._resetGameTime();
    this._setScore(0);
  }

  _updateGameTime(dt) {
    if (GLOBAL_VARIABLES.gameState === GAME_STATE.Gameplay) {
      this._gameTime += dt;

      if (this._gameTime - this._previousGameTime > 1) {
        this._previousGameTime = this._gameTime;
        const round = GLOBAL_VARIABLES.round;
        const score = SCORE_CONFIG.perSecond[round];
        this._addScore(score);
      }
    }
  }

  _updateRoundTime(dt) {
    if (GLOBAL_VARIABLES.gameState === GAME_STATE.Gameplay) {
      this._roundTime += dt * 1000;

      if (this._roundTime > ROUND_CONFIG.roundDuration) {
        this._roundTime = 0;
        this._roundUp();
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
    // this._initBoard();
    this._initSimpleBoard();
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

  _initSimpleBoard() {
    const simpleBoard = this._simpleBoard = new SimpleBoard();
    this.add(simpleBoard);
  }

  _initMaps() {
    const currentLevel = GLOBAL_VARIABLES.currentLevel;
    const fieldConfig = LEVEL_CONFIG[currentLevel].field;
    const ghostMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Ghost] = [];
    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle] = [];
    const consumableMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable] = [];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin] = [];

    for (let row = 0; row < fieldConfig.rows; row++) {
      obstacleMap.push([]);
      ghostMap.push([]);
      consumableMap.push([]);
      evilPumpkinMap.push([]);

      for (let column = 0; column < fieldConfig.columns; column++) {
        obstacleMap[row].push(null);
        consumableMap[row].push(null);
        ghostMap[row].push([]);
        evilPumpkinMap[row].push(null);
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

    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];

    if (obstacleMap[newPosition.row][newPosition.column]) {
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
    this._player.events.on('positionChanged', () => this._onPlayerPositionChanged());
    this._player.events.on('introFinished', () => this._startGameplay());
    this._enemiesController.events.on('positionChanged', () => this._onEnemyPositionChanged());
  }

  _onPlayerPositionChanged() {
    if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    const playerPosition = GLOBAL_VARIABLES.playerPosition;
    this._playerPositionHelper.setPosition(playerPosition);

    this._checkConsumablesCollide();

    if (this._player.isBodyActive()) {
      this._checkGhostCollide();
      this._checkEvilPumpkinCollide();
    }
  }

  _checkGhostCollide() {
    const playerPosition = GLOBAL_VARIABLES.playerPosition;
    const ghostMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Ghost];

    if (ghostMap[playerPosition.row][playerPosition.column] && ghostMap[playerPosition.row][playerPosition.column].length > 0) {
      this._onLose();
      return;
    }
  }

  _checkEvilPumpkinCollide() {
    const playerPosition = GLOBAL_VARIABLES.playerPosition;
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];

    if (evilPumpkinMap[playerPosition.row][playerPosition.column]) {
      this._onLose();
      return;
    }
  }

  _checkConsumablesCollide() {
    const playerPosition = GLOBAL_VARIABLES.playerPosition;
    const consumablesMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable];
    const consumable = consumablesMap[playerPosition.row][playerPosition.column];

    if (consumable) {
      const consumableType = consumable.getType();
      const round = GLOBAL_VARIABLES.round;
      const score = SCORE_CONFIG.consumables[consumableType][round];

      const coordinates = consumable.getCoordinates();
      const consumablePosition = new THREE.Vector3(coordinates.x, 0.7, coordinates.z);
      const screenPosition = vector3ToBlackPosition(consumablePosition, this._renderer, this._camera);
      this._addScore(score);
      this.events.post('onConsumableCollect', consumableType, screenPosition);

      if (consumableType === CONSUMABLE_TYPE.BoosterCandyEnemiesSlow || consumableType === CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability || consumableType === CONSUMABLE_TYPE.BoosterCandyPlayerSpeed) {
        this._startBooster(consumableType);
      }

      this._consumablesController.removeConsumable(consumable, false);
    }
  }

  _startBooster(type) {
    GLOBAL_VARIABLES.activeBooster = type;
    GLOBAL_VARIABLES.boosterSpawned = false;
    
    if (type === CONSUMABLE_TYPE.BoosterCandyEnemiesSlow) {
      this._enemiesController.startEnemiesSlowBooster();
    }

    if (type === CONSUMABLE_TYPE.BoosterCandyPlayerSpeed) {
      this._player.startSpeedBooster();
    }

    if (type === CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability) {
      this._player.startInvulnerabilityBooster();
    }
  }

  _onEnemyPositionChanged() {
    if (this._player.isBodyActive()) {
      this._checkGhostCollide();
      this._checkEvilPumpkinCollide();
    }
    
    this._updateBoardColors();
  }

  _updateBoardColors() {
    const ghostMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Ghost];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];
    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle];

    const enemiesMap = [];

    for (let row = 0; row < ghostMap.length; row++) {
      enemiesMap.push([]);

      for (let column = 0; column < ghostMap[0].length; column++) {
        let isEnemy = 0;

        if (obstacleMap[row][column]) {
          isEnemy = 0;
        } else {
          isEnemy = ghostMap[row][column].length > 0 || evilPumpkinMap[row][column] ? 1 : 0;
        }

        enemiesMap[row].push(isEnemy);
      }
    }

    // this._board.updateEnemiesMap(enemiesMap);
  }
}
