import * as THREE from 'three';
import GameDebug from './game-debug';
import { MessageDispatcher } from 'black-engine';
import SCENE_CONFIG from '../../core/configs/scene-config';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import GameField from './game-field/game-field';
import CameraController from './camera-controller/camera-controller';

export default class GameScene extends THREE.Group {
  constructor(data) {
    super();

    this.events = new MessageDispatcher();

    this._data = data;

    this._gameDebug = null;
    this._gameField = null;

    this._isSoundPlayed = false;

    this._init();
  }

  update(dt) {
    if (dt > 0.1) {
      dt = 0.1;
    }

    this._gameField.update(dt);
  }

  onSoundChanged() {
    this._gameDebug.updateSoundController();
  }

  _init() {
    this._initGameDebug();
    this._initEmptySound();
    this._initCameraController();
    this._initGameField();

    this._initSignals();
  }

  _initGameDebug() {
    this._gameDebug = new GameDebug();
  }

  _initEmptySound() {
    if (SCENE_CONFIG.isMobile) {
      window.addEventListener('touchstart', () => {
        if (this._isSoundPlayed) {
          return;
        }

        const sound = new THREE.PositionalAudio(this._data.audioListener);
        sound.setVolume(0);
        sound.play();

        this._isSoundPlayed = true;
      });
    }
  }

  _initCameraController() {
    const cameraController = this._cameraController = new CameraController(this._data.camera);
    this.add(cameraController);
  }

  _initGameField() {
    const gameField = this._gameField = new GameField();
    this.add(gameField);
  }

  _initSignals() {
    this._gameDebug.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._gameDebug.events.on('orbitControlsChanged', () => this._onOrbitControlsChanged());
    this._gameDebug.events.on('audioEnabledChanged', () => this.events.post('onSoundsEnabledChanged'));
    this._gameDebug.events.on('helpersChanged', () => this._gameField.onHelpersChanged());
  }

  _onOrbitControlsChanged() {
    this._data.orbitControls.enabled = DEBUG_CONFIG.orbitControls;
  }
}
