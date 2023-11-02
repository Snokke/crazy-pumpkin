import { Black, DisplayObject, Ease, Sprite, TextField, Tween } from "black-engine";
import ScreenAbstract from "./screen-abstract";
import SCENE_CONFIG from "../../core/configs/scene-config";

export default class StartGameScreen extends ScreenAbstract {
  constructor() {
    super();

    this._startGameButton = null;
    this._tutorialText = null;

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
    this._initTutorialText();
    this._initStartGameButton();
    this._initSignals();
  }

  _initLogo() {
    const size = SCENE_CONFIG.isMobile ? 120 : 140;

    const logo = this._logo = new TextField('Crazy Pumpkin', 'halloween_spooky', 0xc34c04, size);
    this.add(logo);

    logo.dropShadow = true;
    logo.shadowBlur = 1;
    logo.shadowAlpha = 0.4;
    logo.shadowDistanceX = 4;
    logo.shadowDistanceY = 4;

    logo.alignAnchor(0.5, 0.5);
    logo.touchable = true;
  }

  _initTutorialText() {
    const tutorialText = this._tutorialText = new TextField('Use WASD or arrows to move\nHow long can you survive?', 'halloween_spooky', 0x000000, 50);
    this.add(tutorialText);

    tutorialText.align = 'center';
    tutorialText.multiline = true;

    tutorialText.dropShadow = true;
    tutorialText.shadowBlur = 1;
    tutorialText.shadowAlpha = 0.4;
    tutorialText.shadowDistanceX = 3;
    tutorialText.shadowDistanceY = 3;

    tutorialText.alignAnchor(0.5, 0.5);
    tutorialText.touchable = true;
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

    this._tutorialText.x = bounds.left + bounds.width * 0.5;
    this._tutorialText.y = bounds.top + bounds.height * 0.5;

    this._startGameButton.x = bounds.left + bounds.width * 0.5;
    this._startGameButton.y = bounds.top + bounds.height * 0.7;
  }
}
