import { Black, Ease, TextField, Tween } from "black-engine";
import ScreenAbstract from "./screen-abstract";

export default class GameplayScreen extends ScreenAbstract {
  constructor() {
    super();

    this._score = null;
    this._goText = null;
  }

  setScore(value) {
    this._score.text = `Score: ${value}`;
  }

  showGoText() {
    this._goText.visible = true;
    this._goText.alpha = 1;
    this._goText.scale = 0;

    const showTween = new Tween({ scale: 1 }, 0.4, { ease: Ease.backOut });
    this._goText.add(showTween);

    showTween.on('complete', () => {
      const hideTween = new Tween({ alpha: 0 }, 0.3, { ease: Ease.sinusoidalIn, delay: 0.4 });
      this._goText.add(hideTween);

      hideTween.on('complete', () => {
        this._goText.visible = false;
      });
    });
  }

  _init() {
    this._initScore();
    this._initGoText();
  }

  _initScore() {
    const score = this._score = new TextField('Score: 0', 'halloween_spooky', 0x000000, 50);

    score.alignAnchor(0, 0.5);
    this.add(score);
  }

  _initGoText() {
    const goText = this._goText = new TextField('GO!', 'halloween_spooky', 0x008800, 130);
    this.add(goText);

    goText.dropShadow = true;
    goText.shadowBlur = 1;
    goText.shadowAlpha = 0.4;
    goText.shadowDistanceX = 4;
    goText.shadowDistanceY = 4;

    goText.alignAnchor(0.5, 0.5);
    goText.visible = false;
  }

  _onResize() {
    const bounds = Black.stage.bounds;

    this._score.x = bounds.left + bounds.width * 0.5 - 50;
    this._score.y = bounds.top + 60;

    this._goText.x = bounds.left + bounds.width * 0.5;
    this._goText.y = bounds.top + bounds.height * 0.5;
  }
}
