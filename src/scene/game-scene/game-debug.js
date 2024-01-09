import * as THREE from 'three';
import GUIHelper from '../../core/helpers/gui-helper/gui-helper';
import { MessageDispatcher } from 'black-engine';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import { SOUNDS_CONFIG } from '../../core/configs/sounds-config';
import { GAME_CONFIG } from './game-field/data/game-config';
import { GLOBAL_VARIABLES } from './game-field/data/global-variables';
import { ROUNDS_CONFIG } from './game-field/data/rounds-config';

export default class GameDebug extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._audioEnabledController = null;
    this._increaseRoundButton = null;
    this._decreaseRoundButton = null;

    this._init();
  }

  onRoundChanged() {
    this._increaseRoundButton.disabled = GLOBAL_VARIABLES.round === ROUNDS_CONFIG.length - 1;
    this._decreaseRoundButton.disabled = GLOBAL_VARIABLES.round === 0;
  }

  updateSoundController() {
    this._audioEnabledController.refresh();
  }

  _init() {
    this._initGeneralFolder();
    this._initGameFolder();
  }

  _initGeneralFolder() {
    const generalFolder = GUIHelper.getGui().addFolder({
      title: 'General',
      expanded: false,
    });

    generalFolder.addInput(DEBUG_CONFIG, 'fpsMeter', {
      label: 'FPS meter',
    }).on('change', () => {
      this.events.post('fpsMeterChanged');
    });

    generalFolder.addInput(DEBUG_CONFIG, 'orbitControls', {
      label: 'Orbit controls',
    }).on('change', () => {
      this.events.post('orbitControlsChanged');
    });

    generalFolder.addSeparator();

    this._audioEnabledController = generalFolder.addInput(SOUNDS_CONFIG, 'enabled', {
      label: 'Audio',
    }).on('change', () => {
      this.events.post('audioEnabledChanged');
    });

    generalFolder.addInput(SOUNDS_CONFIG, 'masterVolume', {
      label: 'Master volume',
      min: 0,
      max: 1,
    }).on('change', () => {
      this.events.post('masterVolumeChanged');
    });
  }

  _initGameFolder() {
    const gameFolder = GUIHelper.getGui().addFolder({
      title: 'Game',
      expanded: true,
    });
    
    gameFolder.addInput(GAME_CONFIG, 'helpers', {
      label: 'Helpers',
    }).on('change', () => {
      this.events.post('helpersChanged');
    });

    gameFolder.addSeparator();

    this._decreaseRoundButton = gameFolder.addButton({
      title: 'Decrease round',
    }).on('click', () => {
      this.events.post('decreaseRound');
    });

    this._increaseRoundButton = gameFolder.addButton({
      title: 'Increase round',
    }).on('click', () => {
      this.events.post('increaseRound');
    });

    this.onRoundChanged();
  }
}
