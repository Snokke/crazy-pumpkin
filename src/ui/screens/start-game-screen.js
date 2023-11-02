import { Black, Ease, Sprite, TextField, Tween } from "black-engine";
import ScreenAbstract from "./screen-abstract";
import SCENE_CONFIG from "../../core/configs/scene-config";

export default class StartGameScreen extends ScreenAbstract {
  constructor() {
    super();

    this._startGameButton = null;

    this.touchable = true;
  }

  show() {
    super.show();

    this._animateStartGameButton();
  }

  hide() {
    super.hide();

    this._startGameButton.removeComponent(this._startGameButton.getComponent(Tween));
    this._startGameButton.scale = 1;
  }

  _init() {
    this._initLogo();
    this._initStartGameButton();
    this._initSignals();
  }

  _initLogo() {
    const logo = this._logo = new Sprite('logo');
    this.add(logo);

    logo.alignPivot();
  }

  _initStartGameButton() {
    const startGameButton = this._startGameButton = new TextField('Start Game', 'halloween_spooky', 0x008800, 100);
    this.add(startGameButton);

    startGameButton.dropShadow = true;
    startGameButton.shadowBlur = 1;
    startGameButton.shadowAlpha = 0.4;
    startGameButton.shadowDistanceX = 4;
    startGameButton.shadowDistanceY = 4;

    startGameButton.alignAnchor(0.5, 0.5);
    startGameButton.touchable = true;
  }

  _animateStartGameButton() {
    const tween = new Tween({ scale: 1.03 }, 0.8, { ease: Ease.sinusoidalInOut, loop: true, yoyo: true });
    this._startGameButton.add(tween);
  }

  _initSignals() {
    this._startGameButton.on('pointerDown', () => this.post('onStartGame'));

    this._startGameButton.on('pointerMove', () => {
      Black.engine.containerElement.style.cursor = 'pointer';
    });
  }

  _onResize() {
    const bounds = Black.stage.bounds;

    this._logo.x = bounds.left + bounds.width * 0.5;
    this._logo.y = bounds.top + bounds.height * 0.3;

    this._startGameButton.x = bounds.left + bounds.width * 0.5;
    this._startGameButton.y = bounds.top + bounds.height * 0.7;

    if (SCENE_CONFIG.isMobile) {
      if (window.innerWidth < window.innerHeight) {
        this._logo.scale = 0.6;
      } else {
        this._logo.scale = 1;
      }
    }
  }
}
