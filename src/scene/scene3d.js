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

  onPointerMove(x, y) { }

  onPointerDown(x, y) { }

  onPointerUp(x, y) { }

  onPointerLeave() { }

  onWheelScroll(delta) { }

  onSoundChanged() {
    this._gameScene.onSoundChanged();
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
  }
}
