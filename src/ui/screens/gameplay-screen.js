import { Black, DisplayObject, Ease, Graphics, TextField, Tween } from "black-engine";
import TWEEN from 'three/addons/libs/tween.module.js';
import ScreenAbstract from "./screen-abstract";
import { GLOBAL_VARIABLES } from "../../scene/game-scene/game-field/data/global-variables";
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from "../../scene/game-scene/game-field/consumables/data/consumables-config";
import { SCORE_CONFIG } from "../../scene/game-scene/game-field/data/score-config";

export default class GameplayScreen extends ScreenAbstract {
  constructor() {
    super();

    this._scoreText = null;
    this._goText = null;
    this._round = null;
    this._collectedScore = null;
    this._boosterText = null;
    this._boosterGroup = null;
    this._progressBar = null;
    this._progressBarTween = null;
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
    this._scoreText.text = `Score: ${value}`;
  }

  onConsumableCollect(consumableType, position) {
    this._collectedScore.removeComponent(this._collectedScore.getComponent(Tween));

    let text;

    if (consumableType === CONSUMABLE_TYPE.SmallCandy || consumableType === CONSUMABLE_TYPE.BigCandy) {
      this._collectedScore.textColor = 0x000000;
      const round = GLOBAL_VARIABLES.round;
      const score = SCORE_CONFIG.consumables[consumableType][round];
      text = `+${score}`;
    }

    if (consumableType === CONSUMABLE_TYPE.BoosterCandyEnemiesSlow || consumableType === CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability || consumableType === CONSUMABLE_TYPE.BoosterCandyPlayerSpeed) {
      const config = CONSUMABLES_CONFIG[consumableType];
      this._collectedScore.textColor = config.color;
      text = `${CONSUMABLES_CONFIG[consumableType].name}`;
      this._showBoosterProgressBar(consumableType);
    }

    this._collectedScore.text = text;
    this._collectedScore.visible = true;
    this._collectedScore.alpha = 1;
    this._collectedScore.x = position.x;
    this._collectedScore.y = position.y;

    const tween = new Tween({ y: position.y - 30, alpha: 0 }, 0.8, { ease: Ease.sinusoidalOut, });
    this._collectedScore.add(tween);

    tween.on('complete', () => {
      this._collectedScore.visible = false;
    });
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

  reset() {
    this._boosterGroup.visible = false;
    this._progressBarTween?.stop();
  }

  _showBoosterProgressBar(type) {
    const config = CONSUMABLES_CONFIG[type];

    this._boosterGroup.visible = true;

    this._boosterText.text = config.name;
    this._boosterText.textColor = config.color;
    
    this._progressBar.x = -config.progressBarWidth * 0.5;

    const progress = { percent: 1 };

    this._progressBarTween = new TWEEN.Tween(progress)
      .to({ percent: 0 }, config.duration)
      .start()
      .onUpdate(() => {
        this._updateProgressBar(type, progress.percent);
      })
      .onComplete(() => {
        this._boosterGroup.visible = false;
      });
  }

  _updateProgressBar(type, percent) {
    const config = CONSUMABLES_CONFIG[type];

    this._progressBar.clear();
    this._progressBar.beginPath();
    this._progressBar.fillStyle(config.color);
    this._progressBar.rect(0, 0, config.progressBarWidth * percent, 7);
    this._progressBar.fill();
  }

  _init() {
    this._initScore();
    this._initRoundText();
    this._initGoText();
    this._initCollectedScore();
    this._initBoosterGroup();
  }

  _initScore() {
    const score = this._scoreText = new TextField('Score: 0', 'halloween_spooky', 0x000000, 50);

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

  _initCollectedScore() {
    const collectedScore = this._collectedScore = new TextField('', 'halloween_spooky', 0x000000, 50);
    this.add(collectedScore);

    collectedScore.dropShadow = true;
    collectedScore.shadowBlur = 1;
    collectedScore.shadowAlpha = 0.4;
    collectedScore.shadowDistanceX = 4;
    collectedScore.shadowDistanceY = 4;

    collectedScore.alignAnchor(0.5, 0.5);
    collectedScore.visible = false;
  }

  _initBoosterGroup() {
    const boosterGroup = this._boosterGroup = new DisplayObject();
    this.add(boosterGroup);

    boosterGroup.visible = false;

    this._initBoosterProgressBar();
    this._initBoosterText();
  }

  _initBoosterText() {
    const boosterText = this._boosterText = new TextField('', 'halloween_spooky', 0xffffff, 50);
    this._boosterGroup.add(boosterText);

    boosterText.alignAnchor(0.5, 0.5);

    const config = CONSUMABLES_CONFIG[CONSUMABLE_TYPE.BoosterCandyEnemiesSlow];
    const color = config.color;
    boosterText.textColor = color;
  }

  _initBoosterProgressBar() {
    const progressBar = this._progressBar = new Graphics();
    this._boosterGroup.add(progressBar);

    progressBar.beginPath();
    progressBar.fillStyle(0x000000);
    progressBar.rect(0, 0, 100, 5);
    progressBar.fill();

    progressBar.alignAnchor(0, 0.5);
    progressBar.y = 29;
  }

  _onResize() {
    const bounds = Black.stage.bounds;

    this._scoreText.x = bounds.right - 300;
    this._scoreText.y = bounds.top + 70;

    this._goText.x = bounds.left + bounds.width * 0.5;
    this._goText.y = bounds.top + bounds.height * 0.5;

    this._roundCaption.x = bounds.left + bounds.width * 0.5 - 35;
    this._roundCaption.y = bounds.top + 70;

    this._round.x = bounds.left + bounds.width * 0.5 + 35;
    this._round.y = bounds.top + 70;

    this._boosterGroup.x = bounds.left + 300;
    this._boosterGroup.y = bounds.top + 70;
  }
}
