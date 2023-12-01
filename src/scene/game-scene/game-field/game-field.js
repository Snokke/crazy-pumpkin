import * as THREE from 'three';
import Player from './player/player';
import EnemiesController from './enemies/enemies-controller';
import { BUTTONS_CONFIG, BUTTON_TYPE } from './data/keyboard-config';
import ObstaclesController from './obstacles/obstacles-controller';
import { LEVEL_CONFIG } from './data/level-config';
import { PLAYER_ACTIONS, PLAYER_ACTION_TO_DIRECTION, PLAYER_CONVERT_JUMP_IN_PLACE } from './player/data/player-data';
import ObjectPositionHelper from './helpers/object-position-helper';
import { GAME_OBJECT_TYPE, GAME_STATE, MAP_TYPE } from './data/game-data';
import { GAME_CONFIG } from './data/game-config';
import { MessageDispatcher } from 'black-engine';
import { SCORE_CONFIG } from './data/score-config';
import ConsumablesController from './consumables/consumables-controller';
import { GLOBAL_VARIABLES } from './data/global-variables';
import { vector3ToBlackPosition } from '../../../core/helpers/helpers';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from './consumables/data/consumables-config';
import Board from './board/board';
import { ENVIRONMENT_CONFIG } from '../environment/data/environment-config';
import DEBUG_CONFIG from '../../../core/configs/debug-config';
import { SOUNDS_CONFIG } from '../../../core/configs/sounds-config';
import Loader from '../../../core/loader';
import Delayed from '../../../core/helpers/delayed-call';
import { ROUNDS_CONFIG } from './data/rounds-config';

export default class GameField extends THREE.Group {
  constructor(renderer, camera, audioListener) {
    super();

    this.events = new MessageDispatcher();

    this._renderer = renderer;
    this._camera = camera;
    this._audioListener = audioListener;

    this._player = null;
    this._enemiesController = null;
    this._obstaclesController = null;
    this._consumablesController = null;
    this._bossesController = null;
    this._board = null;

    this._playerActions = null;

    this._score = 0;
    this._previousGameTime = 0;
    this._gameTime = 0;
    this._roundTime = 0;
    this._isTutorialShown = false;

    this._globalVolume = SOUNDS_CONFIG.masterVolume;

    this._init();
  }

  update(dt) {
    this._player.update(dt);
    this._enemiesController.update(dt);
    this._consumablesController.update(dt);
    this._updateGameTime(dt);
    this._updateRoundTime(dt);
    // this._bossesController.update(dt);
  }

  initLevel(roundNumber) {
    this._resetLevel();

    GLOBAL_VARIABLES.gameState = GAME_STATE.Idle;
    GLOBAL_VARIABLES.round = roundNumber;
    this.events.post('roundUp');
    this.events.post('initLevel');
    this.events.post('livesChanged');

    this._initPlayerForLevel();

    this._initMaps();
    this._obstaclesController.createObstacles();

    // this._bossesController.spawnBosses();
  }

  startGame() {
    this._obstaclesController.showIntro().on('complete', () => {
      this._player.spawn();
    });
  }

  restartGame() {
    this.initLevel(0);
    this.startGame();
  }

  onHelpersChanged() {
    this._player.debugChangedHelper();
    this._playerPositionHelper.debugChangedHelper();
    this._playerPositionHelper.setPosition(this._player.getPosition());
    this._obstaclesController.debugChangedHelper();
    this._enemiesController.debugChangedHelper();
  }

  onRoundChanged() {
    this._player.onRoundChanged();
    this._enemiesController.onRoundChanged();
  }

  onButtonPressed(buttonType) {
    if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    this._onButtonPress(buttonType);
  }

  onSoundChanged() {
    const collectVolume = SOUNDS_CONFIG.enabled ? SOUNDS_CONFIG.masterVolume * SOUNDS_CONFIG.collectSoundVolume : 0;
    this._collectSound.setVolume(collectVolume);

    const gameOverVolume = SOUNDS_CONFIG.enabled ? SOUNDS_CONFIG.masterVolume * SOUNDS_CONFIG.gameOverSoundVolume : 0;
    this._gameOverSound.setVolume(gameOverVolume);

    this._player.onSoundChanged();
    this._obstaclesController.onSoundChanged();
  }

  onEnvironmentPumpkinClick() {
    this._enemiesController.changeGhostsColor();
  }

  _startGameplay() {
    GLOBAL_VARIABLES.gameState = GAME_STATE.Gameplay;
    this._enemiesController.activateSpawnEnemies();
    this._consumablesController.activateSpawnConsumables();
    this.events.post('gameplayStarted');
  }

  _roundUp() {
    if (GLOBAL_VARIABLES.round >= ROUNDS_CONFIG.maxRound) {
      return;
    }
    
    GLOBAL_VARIABLES.round++;
    this.events.post('roundUp');
  }

  _initPlayerForLevel() {
    const playerConfig = GAME_CONFIG.playerStartPosition;
    this._player.setPosition(playerConfig.position);
    this._player.setDirection(playerConfig.direction);

    if (GAME_CONFIG.helpers) {
      this._playerPositionHelper.setPosition(playerConfig.position);
      this._playerPositionHelper.show();
    }
  }

  _resetLevel() {
    this._player.hide();
    this._player.reset();
    this._enemiesController.reset();
    this._obstaclesController.reset();
    this._consumablesController.reset();

    GLOBAL_VARIABLES.boosterSpawned = false;
    GLOBAL_VARIABLES.activeBooster = null;
    GLOBAL_VARIABLES.playerLives = 3;
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

      if (this._roundTime > ROUNDS_CONFIG.roundDuration) {
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

  _playSound(sound) {
    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();
  }

  _init() {
    this._initPlayer();
    this._initEnemiesController();
    this._initBossesController();
    this._initObstaclesController();
    this._initConsumablesController();
    this._initPlayerPositionHelper();
    this._initBoard();
    this._initKeyboardEvents();
    this._initCollectSound();
    this._initGameOverSound();

    this._initSignals();
  }

  _initPlayer() {
    const player = this._player = new Player(this._audioListener);
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

  _initBossesController() {
    // const bossesController = this._bossesController = new BossesController();
    // this.add(bossesController);
  }

  _initObstaclesController() {
    const obstaclesController = this._obstaclesController = new ObstaclesController(this._audioListener);
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
    const fieldConfig = GAME_CONFIG.field;
    const ghostMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Ghost] = [];
    const obstacleMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Obstacle] = [];
    const consumableMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Consumable] = [];
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin] = [];
    const skeletonMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Skeleton] = [];

    for (let row = 0; row < fieldConfig.rows; row++) {
      obstacleMap.push([]);
      ghostMap.push([]);
      consumableMap.push([]);
      evilPumpkinMap.push([]);
      skeletonMap.push([]);

      for (let column = 0; column < fieldConfig.columns; column++) {
        obstacleMap[row].push(null);
        consumableMap[row].push(null);
        ghostMap[row].push([]);
        evilPumpkinMap[row].push(null);
        skeletonMap[row].push(null);
      }
    }
  }

  _initPlayerPositionHelper() {
    const playerPositionHelper = this._playerPositionHelper = new ObjectPositionHelper(GAME_OBJECT_TYPE.Player);
    this.add(playerPositionHelper);
  }

  _initCollectSound() {
    const collectSound = this._collectSound = new THREE.PositionalAudio(this._audioListener);
    this.add(collectSound);

    collectSound.setRefDistance(10);
    collectSound.setVolume(this._globalVolume * SOUNDS_CONFIG.collectSoundVolume);
    this.add(collectSound);

    Loader.events.on('onAudioLoaded', () => {
      collectSound.setBuffer(Loader.assets['collect']);
    });
  }

  _initGameOverSound() {
    const gameOverSound = this._gameOverSound = new THREE.PositionalAudio(this._audioListener);
    this.add(gameOverSound);

    gameOverSound.setRefDistance(10);
    gameOverSound.setVolume(this._globalVolume * SOUNDS_CONFIG.gameOverSoundVolume);
    this.add(gameOverSound);

    Loader.events.on('onAudioLoaded', () => {
      gameOverSound.setBuffer(Loader.assets['game-over']);
    });
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
    if (!this._isTutorialShown) {
      this._isTutorialShown = true;
      this.events.post('onButtonPress');
    }

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
    const fieldConfig = GAME_CONFIG.field;
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

  _onLoseLive() {
    if (GLOBAL_VARIABLES.gameState === GAME_STATE.GameOver) {
      return;
    }

    GLOBAL_VARIABLES.playerLives--;
    this.events.post('livesChanged');

    if (GLOBAL_VARIABLES.playerLives <= 0) {
      this._onLose();
      return;
    }

    if (GLOBAL_VARIABLES.activeBooster) {
      this.events.post('stopBooster');
      GLOBAL_VARIABLES.activeBooster = null;
      this._enemiesController.stopEnemiesSlowBooster();
    }

    this._player.onLoseLive();
  }

  _onLose() {
    if (GLOBAL_VARIABLES.gameState === GAME_STATE.GameOver) {
      return;
    }
    
    GLOBAL_VARIABLES.gameState = GAME_STATE.GameOver;
    this._enemiesController.stopTweens();
    this._consumablesController.stopTweens();
    this._player.onKill();
    this.events.post('focusCameraOnPlayer');

    Delayed.call(700, () => {
      this._playSound(this._gameOverSound);
    });
  }

  _initSignals() {
    this._player.events.on('positionChanged', () => this._onPlayerPositionChanged());
    this._player.events.on('introFinished', () => this._startGameplay());
    this._player.events.on('onKill', () => this._onPlayerKill());
    this._player.events.on('startInvulnerabilityBooster', (msg, duration) => this.events.post('startInvulnerabilityBooster', duration));
    this._enemiesController.events.on('positionChanged', () => this._onEnemyPositionChanged());
  }

  _onPlayerKill() {
    this.events.post('gameOver');
  }

  _onPlayerPositionChanged() {
    if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    const playerPosition = GLOBAL_VARIABLES.playerPosition;
    this._playerPositionHelper.setPosition(playerPosition);

    this._checkConsumablesCollide();

    if (!DEBUG_CONFIG.invulnerability && this._player.isBodyActive()) {
      this._checkGhostCollide();
      this._checkEvilPumpkinCollide();
      this._checkSkeletonCollide();
    }

    const archPositionForHide = ENVIRONMENT_CONFIG.arch.playerPositionsForHide;
    if (archPositionForHide.some(position => position.row === playerPosition.row && position.column === playerPosition.column)) {
      this.events.post('onPlayerInArch');
    } else {
      this.events.post('onPlayerOutArch');
    }
  }

  _checkGhostCollide() {
    if (!this._player.isBodyActive()) {
      return;
    }

    const playerPosition = GLOBAL_VARIABLES.playerPosition;
    const ghostMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Ghost];

    if (ghostMap[playerPosition.row][playerPosition.column] && ghostMap[playerPosition.row][playerPosition.column].length > 0) {
      this._onLoseLive();
      return;
    }
  }

  _checkEvilPumpkinCollide() {
    if (!this._player.isBodyActive()) {
      return;
    }
    
    const playerPosition = GLOBAL_VARIABLES.playerPosition;
    const evilPumpkinMap = GLOBAL_VARIABLES.maps[MAP_TYPE.EvilPumpkin];

    if (evilPumpkinMap[playerPosition.row][playerPosition.column]) {
      this._onLoseLive();
      return;
    }
  }

  _checkSkeletonCollide() {
    if (!this._player.isBodyActive()) {
      return;
    }
    
    const playerPosition = GLOBAL_VARIABLES.playerPosition;
    const skeletonMap = GLOBAL_VARIABLES.maps[MAP_TYPE.Skeleton];

    if (skeletonMap[playerPosition.row][playerPosition.column]) {
      this._onLoseLive();
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

      this._collectSound.position.copy(consumablePosition);
      this._playSound(this._collectSound);

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
      const boosterConfig = CONSUMABLES_CONFIG[CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability];
      this._player.startInvulnerabilityBooster(boosterConfig.duration);
    }
  }

  _onEnemyPositionChanged() {
    if (!DEBUG_CONFIG.invulnerability && this._player.isBodyActive()) {
      this._checkGhostCollide();
      this._checkEvilPumpkinCollide();
      this._checkSkeletonCollide();
    }
  }
}
