import { Black, DisplayObject, Message } from "black-engine";
import Overlay from "./overlay";
import SoundIcon from "./sound-icon";
import StartGameScreen from "./screens/start-game-screen";
import GameplayScreen from "./screens/gameplay-screen";
import GameOverScreen from "./screens/game-over-screen";
import DEBUG_CONFIG from "../core/configs/debug-config";

export default class UI extends DisplayObject {
  constructor() {
    super();

    this._overlay = null;
    this._soundIcon = null;

    this._startGameScreen = null;
    this._gameplayScreen = null;
    this._gamOverScreen = null;

    this._allScreens = [];

    this.touchable = true;
  }

  updateSoundIcon() {
    this._soundIcon.updateTexture();
  }

  onGameOver() {
    this._gameplayScreen.hide();
    this._gameOverScreen.show();
  }

  onScoreChanged(score) {
    this._gameplayScreen.setScore(score);
    this._gameOverScreen.setScore(score);
  }

  onGameplayStarted() {
    this._gameplayScreen.showGoText();
  }

  onAdded() {
    this._initOverlay();
    this._initSoundIcon();
    this._initScreens();
    this._initSignals();

    this.stage.on(Message.RESIZE, this._handleResize, this);
    this._handleResize();
  }

  _initOverlay() {
    const overlay = this._overlay = new Overlay();
    this.add(overlay);
  }

  _initSoundIcon() {
    const soundIcon = this._soundIcon = new SoundIcon();
    this.add(soundIcon);
  }

  _initScreens() {
    this._initStartGameScreen();
    this._initGameplayScreen();
    this._initGameOverScreen();

    this._startGameScreen.show();

    if (DEBUG_CONFIG.startFromGameplay) {
      this._onStartGame();
    }
  }

  _initStartGameScreen() {
    const startGameScreen = this._startGameScreen = new StartGameScreen();
    this.add(startGameScreen);

    this._allScreens.push(startGameScreen);
  }

  _initGameplayScreen() {
    const gameplayScreen = this._gameplayScreen = new GameplayScreen();
    this.add(gameplayScreen);

    this._allScreens.push(gameplayScreen);
  }

  _initGameOverScreen() {
    const gameOverScreen = this._gameOverScreen = new GameOverScreen();
    this.add(gameOverScreen);

    this._allScreens.push(gameOverScreen);
  }

  _initSignals() {
    this._overlay.on('onPointerMove', (msg, x, y) => this._onOverlayPointerMove(x, y));
    this._soundIcon.on('onSoundChanged', () => this.post('onSoundChanged'));

    this._startGameScreen.on('onStartGame', () => this._onStartGame());
    this._gameOverScreen.on('onRestartGame', () => this._onRestartGame());
  }

  _onOverlayPointerMove(x, y) {
    this._allScreens.forEach(screen => screen.onOverlayMove());
  }

  _onStartGame() {
    this._startGameScreen.hide();
    this._gameplayScreen.show();
    this.post('onStartGame');
  }

  _onRestartGame() {
    this._gameOverScreen.hide();
    this._gameplayScreen.show();
    this.post('onRestartGame');
  }

  _handleResize() {
    const bounds = Black.stage.bounds;

    this._soundIcon.x = bounds.left + 50;
    this._soundIcon.y = bounds.top + 50;
  }
}
