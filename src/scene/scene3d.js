import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';
import GameScene from './game-scene/game-scene';

export default class Scene3D extends THREE.Group {
  constructor(data) {
    super();

    this.events = new MessageDispatcher();

    this._data = data,
    this._scene = data.scene,
    this._camera = data.camera,

    this._raycasterController = null;
    this._gameScene = null;

    this._init();
  }

  update(dt) {
    this._gameScene.update(dt);
  }

  onSoundChanged() {
    this._gameScene.onSoundChanged();
  }

  onStartGame() {
    this._gameScene.onStartGame();
  }

  onRestartGame() {
    this._gameScene.onRestartGame();
  }

  onButtonPressed(buttonType) {
    this._gameScene.onButtonPressed(buttonType);
  }

  onPointerMove(x, y) {
    this._gameScene.onPointerMove(x, y);
  }

  onPointerDown() {
    this._gameScene.onPointerDown();
  }

  onPointerUp() {
    this._gameScene.onPointerUp();
  }

  _init() {
    this._initGameScene();
    this._initSignals();
  }

  _initGameScene() {
    const gameScene = this._gameScene = new GameScene(this._data);
    this.add(gameScene);
  }

  _initSignals() {
    this._gameScene.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._gameScene.events.on('onSoundsEnabledChanged', () => this.events.post('onSoundsEnabledChanged'));
    this._gameScene.events.on('gameOver', () => this.events.post('gameOver'));
    this._gameScene.events.on('scoreChanged', (msg, score) => this.events.post('scoreChanged', score));
    this._gameScene.events.on('onConsumableCollect', (msg, consumableType, position) => this.events.post('onConsumableCollect', consumableType, position));
    this._gameScene.events.on('gameplayStarted', () => this.events.post('gameplayStarted'));
    this._gameScene.events.on('onRoundChanged', () => this.events.post('onRoundChanged'));
    this._gameScene.events.on('onButtonPress', () => this.events.post('onButtonPress'));
    this._gameScene.events.on('stopBooster', () => this.events.post('stopBooster'));
    this._gameScene.events.on('startInvulnerabilityBooster', (msg, duration) => this.events.post('startInvulnerabilityBooster', duration));
  }
}
