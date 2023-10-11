import * as THREE from 'three';
import GUIHelper from '../../core/helpers/gui-helper/gui-helper';
import { MessageDispatcher } from 'black-engine';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import { SOUNDS_CONFIG } from '../../core/configs/sounds-config';

export default class GameDebug extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._audioEnabledController = null;

    this._init();
  }

  updateSoundController() {
    this._audioEnabledController.refresh();
  }

  _init() {
    this._initGeneralFolder();
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
}
