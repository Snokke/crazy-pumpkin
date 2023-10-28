import { Black, Ease, TextField, Tween } from "black-engine";
import ScreenAbstract from "./screen-abstract";
import { GLOBAL_VARIABLES } from "../../scene/game-scene/game-field/data/global-variables";

export default class GameplayScreen extends ScreenAbstract {
  constructor() {
    super();

    this._score = null;
    this._goText = null;
    this._round = null;
  }

  updateRound() {
    const currentRound = GLOBAL_VARIABLES.round;
    this._round.text = `${currentRound + 1}`;

    this._round.removeComponent(this._round.getComponent(Tween));

    const tween = new Tween({ scale: 1.7 }, 0.3, { ease: Ease.sinusoidalOut, });
    this._round.add(tween);

    tween.on('complete', () => {
      const tween = new Tween({ scale: 1 }, 0.3, { ease: Ease.sinusoidalIn, });
      this._round.add(tween);
    });
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
    this._initRoundText();
    this._initGoText();
  }

  _initScore() {
    const score = this._score = new TextField('Score: 0', 'halloween_spooky', 0x000000, 50);

    score.alignAnchor(0, 0.5);
    this.add(score);
  }

  _initRoundText() {
    const roundCaption = this._roundCaption = new TextField('Round:', 'halloween_spooky', 0x000000, 50);
    this.add(roundCaption);

    roundCaption.alignAnchor(0.5, 0.5);

    const round = this._round = new TextField('1', 'halloween_spooky', 0x000000, 50);
    this.add(round);

    round.alignAnchor(0.5, 0.5);
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

    this._score.x = bounds.right - 300;
    this._score.y = bounds.top + 70;

    this._goText.x = bounds.left + bounds.width * 0.5;
    this._goText.y = bounds.top + bounds.height * 0.5;

    this._roundCaption.x = bounds.left + bounds.width * 0.5 - 35;
    this._roundCaption.y = bounds.top + 70;

    this._round.x = bounds.left + bounds.width * 0.5 + 35;
    this._round.y = bounds.top + 70;
  }
}
