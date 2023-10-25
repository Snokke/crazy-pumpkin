import { Black, Ease, TextField, Tween } from "black-engine";
import ScreenAbstract from "./screen-abstract";

export default class GameOverScreen extends ScreenAbstract {
  constructor() {
    super();

    this._gameOverText = null;
    this._scoreText = null;
    this._restartGameButton = null;

    this._score = 0;
  }

  setScore(value) {
    this._score = value;
  }

  show() {
    super.show();

    this._animateRestartGameButton();
    this._updateScoreText();
  }

  hide() {
    super.hide();

    this._restartGameButton.removeComponent(this._restartGameButton.getComponent(Tween));
    this._restartGameButton.scale = 1;
  }

  _updateScoreText() {
    this._scoreText.text = `Your score: ${this._score}`;
  }

  _init() {
    this._initGameOverText();
    this._initScoreText();
    this._initRestartGameButton();
    this._initSignals();
  }

  _initGameOverText() {
    const gameOverText = this._gameOverText = new TextField('Game Over', 'halloween_spooky', 0x000000, 140);

    gameOverText.dropShadow = true;
    gameOverText.shadowBlur = 1;
    gameOverText.shadowAlpha = 0.4;
    gameOverText.shadowDistanceX = 4;
    gameOverText.shadowDistanceY = 4;

    gameOverText.alignAnchor(0.5, 0.5);
    this.add(gameOverText);
  }

  _initScoreText() {
    const scoreText = this._scoreText = new TextField('Your score: 1000', 'halloween_spooky', 0x000000, 70);

    scoreText.dropShadow = true;
    scoreText.shadowBlur = 1;
    scoreText.shadowAlpha = 0.4;
    scoreText.shadowDistanceX = 4;
    scoreText.shadowDistanceY = 4;

    scoreText.alignAnchor(0.5, 0.5);
    this.add(scoreText);
  }

  _initRestartGameButton() {
    const restartGameButton = this._restartGameButton = new TextField('Restart Game', 'halloween_spooky', 0xaa0000, 100);
    this.add(restartGameButton);

    restartGameButton.dropShadow = true;
    restartGameButton.shadowBlur = 1;
    restartGameButton.shadowAlpha = 0.4;
    restartGameButton.shadowDistanceX = 4;
    restartGameButton.shadowDistanceY = 4;

    restartGameButton.alignAnchor(0.5, 0.5);
    restartGameButton.touchable = true;
  }

  _animateRestartGameButton() {
    const tween = new Tween({ scale: 1.03 }, 0.8, { ease: Ease.sinusoidalInOut, loop: true, yoyo: true });
    this._restartGameButton.add(tween);
  }

  _initSignals() {
    this._restartGameButton.on('pointerDown', () => this.post('onRestartGame'));

    this._restartGameButton.on('pointerMove', () => {
      Black.engine.containerElement.style.cursor = 'pointer';
    });
  }

  _onResize() {
    const bounds = Black.stage.bounds;

    this._gameOverText.x = bounds.left + bounds.width * 0.5;
    this._gameOverText.y = bounds.top + bounds.height * 0.3;

    this._scoreText.x = bounds.left + bounds.width * 0.5;
    this._scoreText.y = bounds.top + bounds.height * 0.5;

    this._restartGameButton.x = bounds.left + bounds.width * 0.5;
    this._restartGameButton.y = bounds.top + bounds.height * 0.7;
  }
}
