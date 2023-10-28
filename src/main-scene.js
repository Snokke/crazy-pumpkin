import { Black, MessageDispatcher } from "black-engine";
import UI from "./ui/ui";
import Scene3D from "./scene/scene3d";

export default class MainScene {
  constructor(data) {
    this.events = new MessageDispatcher();

    this._data = data;
    this._scene = data.scene;
    this._camera = data.camera;

    this._scene3D = null;
    this._ui = null;

    this._init();
  }

  afterAssetsLoad() {
    Black.stage.addChild(this._ui);
    this._scene.add(this._scene3D);
  }

  update(dt) {
    this._scene3D.update(dt);
  }

  _init() {
    this._scene3D = new Scene3D(this._data);
    this._ui = new UI();

    this._initSignals();
  }

  _initSignals() {
    this._ui.on('onSoundChanged', () => this._scene3D.onSoundChanged());
    this._ui.on('onStartGame', () => this._scene3D.onStartGame());
    this._ui.on('onRestartGame', () => this._scene3D.onRestartGame());

    this._scene3D.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._scene3D.events.on('onSoundsEnabledChanged', () => this._ui.updateSoundIcon());
    this._scene3D.events.on('gameOver', () => this._ui.onGameOver());
    this._scene3D.events.on('scoreChanged', (msg, score) => this._ui.onScoreChanged(score));
    this._scene3D.events.on('gameplayStarted', () => this._ui.onGameplayStarted());
    this._scene3D.events.on('onRoundChanged', () => this._ui.onRoundChanged());
  }
}
