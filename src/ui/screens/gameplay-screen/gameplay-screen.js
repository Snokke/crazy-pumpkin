import { Black, DisplayObject, Ease, TextField, Tween } from "black-engine";
import ScreenAbstract from "../screen-abstract";
import { GLOBAL_VARIABLES } from "../../../scene/game-scene/game-field/data/global-variables";
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from "../../../scene/game-scene/game-field/consumables/data/consumables-config";
import { SCORE_CONFIG } from "../../../scene/game-scene/game-field/data/score-config";
import ProgressBar from "../../progress-bar";
import { ROUND_CONFIG } from "../../../scene/game-scene/game-field/data/game-config";
import SCENE_CONFIG from "../../../core/configs/scene-config";
import DPad from "./d-pad";

export default class GameplayScreen extends ScreenAbstract {
  constructor() {
    super();

    this._scoreNumberText = null;
    this._goText = null;
    this._roundNumberText = null;
    this._collectedScore = null;
    this._boosterText = null;
    this._boosterGroup = null;
    this._powerUpProgressBar = null;
    this._roundProgressBar = null;
    this._roundGroup = null;
    this._newRoundText = null;
    this._dPad = null;
  }

  update(dt) {
    this._roundProgressBar.update(dt);
  }

  show() {
    super.show();

    const duration = ROUND_CONFIG.roundDuration;
    this._roundProgressBar.show(0x000000, 140, duration);

    this._showNewRound();
  }

  updateRound() {
    const currentRound = GLOBAL_VARIABLES.round;
    this._roundNumberText.text = `${currentRound + 1}`;

    if (currentRound !== ROUND_CONFIG.maxRound) {
      const duration = ROUND_CONFIG.roundDuration;
      this._roundProgressBar.show(0x000000, 140, duration);
    }

    this._showNewRound();
  }

  setScore(value) {
    this._scoreNumberText.text = `${value}`;
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

    const showTween = new Tween({ scale: 1 }, 0.4, { ease: Ease.backOut, delay: 0.2 });
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
    this._powerUpProgressBar.reset();
    this._roundProgressBar.reset();
  }

  hideTutorial() {
    const hideTween = new Tween({ scale: 0 }, 0.5, { ease: Ease.backIn, delay: 0.4 });
    this._tutorial.add(hideTween);
  }

  onOverlayMove() {
    if (this.visible && Black.engine.containerElement.style.cursor !== 'grab' && Black.engine.containerElement.style.cursor !== 'grabbing') {
      Black.engine.containerElement.style.cursor = 'grab';
    }
  }

  _showNewRound() {
    this._newRoundText.text = `Round: ${GLOBAL_VARIABLES.round + 1}`;

    this._newRoundText.visible = true;
    this._newRoundText.alpha = 0.85;
    this._newRoundText.scale = 0;

    const showTween = new Tween({ scale: 1 }, 0.4, { ease: Ease.backOut, delay: 0.2 });
    this._newRoundText.add(showTween);

    showTween.on('complete', () => {
      const hideTween = new Tween({ alpha: 0 }, 0.3, { ease: Ease.sinusoidalIn, delay: 0.4 });
      this._newRoundText.add(hideTween);

      hideTween.on('complete', () => {
        this._newRoundText.visible = false;
      });
    });
  }

  _showBoosterProgressBar(type) {
    const config = CONSUMABLES_CONFIG[type];

    this._boosterGroup.visible = true;

    this._boosterText.text = config.name;
    this._boosterText.textColor = config.color;

    this._powerUpProgressBar.show(config.color, config.progressBarWidth, config.duration);
  }

  _init() {
    this._initScore();
    this._initRoundText();
    this._initGoText();
    this._initCollectedScore();
    this._initBoosterGroup();
    this._initRoundProgressBar();
    this._initNewRoundText();
    this._initDPad();
    this._initTutorial();
  }

  _initScore() {
    const scoreGroup = this._scoreGroup = new DisplayObject();
    this.add(scoreGroup);

    const scoreCaption = new TextField('Score:', 'halloween_spooky', 0x000000, 50);

    scoreCaption.alignAnchor(0, 0.5);
    scoreGroup.add(scoreCaption);
    scoreCaption.x = -60

    const scoreNumberText = this._scoreNumberText = new TextField('0', 'halloween_spooky', 0x000000, 50);

    scoreNumberText.alignAnchor(0, 0.5);
    scoreGroup.add(scoreNumberText);
    scoreNumberText.x = 45;
  }

  _initRoundText() {
    const roundGroup = this._roundGroup = new DisplayObject();
    this.add(roundGroup);

    const roundCaption = this._roundCaption = new TextField('Round:', 'halloween_spooky', 0x000000, 50);
    roundGroup.add(roundCaption);

    roundCaption.alignAnchor(0, 0.5);
    roundCaption.x = -70;

    const roundNumberText = this._roundNumberText = new TextField('1', 'halloween_spooky', 0x000000, 50);
    roundGroup.add(roundNumberText);

    roundNumberText.alignAnchor(0, 0.5);

    roundNumberText.x = 45;
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
    const powerUpProgressBar = this._powerUpProgressBar = new ProgressBar(true);
    this._boosterGroup.add(powerUpProgressBar);

    powerUpProgressBar.on('complete', () => {
      this._boosterGroup.visible = false;
    });
  }

  _initRoundProgressBar() {
    const roundProgressBar = this._roundProgressBar = new ProgressBar(false);
    this._roundGroup.add(roundProgressBar);

    roundProgressBar.x = -70;
    roundProgressBar.y = 2;
  }

  _initNewRoundText() {
    const newRoundText = this._newRoundText = new TextField('Round', 'halloween_spooky', 0x008800, 110);
    this.add(newRoundText);

    newRoundText.alignAnchor(0.5, 0.5);

    newRoundText.dropShadow = true;
    newRoundText.shadowBlur = 1;
    newRoundText.shadowAlpha = 0.4;
    newRoundText.shadowDistanceX = 4;
    newRoundText.shadowDistanceY = 4;

    newRoundText.visible = false;
  }

  _initDPad() {
    if (!SCENE_CONFIG.isMobile) {
      return;
    }

    const dPad = this._dPad = new DPad();
    this.add(dPad);

    dPad.on('onLeft', () => this.post('onLeft'));
    dPad.on('onRight', () => this.post('onRight'));
    dPad.on('onUp', () => this.post('onUp'));
    dPad.on('onDown', () => this.post('onDown'));
  }

  _initTutorial() {
    const tutorial = this._tutorial = new TextField('Use WASD or arrows to move', 'halloween_spooky', 0xffffff, 60);
    this.add(tutorial);

    tutorial.alignAnchor(0.5, 0.5);

    tutorial.dropShadow = true;
    tutorial.shadowBlur = 1;
    tutorial.shadowAlpha = 0.4;
    tutorial.shadowDistanceX = 4;
    tutorial.shadowDistanceY = 4;

    if (SCENE_CONFIG.isMobile) {
      tutorial.visible = false;
    }
  }

  _onResize() {
    const bounds = Black.stage.bounds;

    this._goText.x = bounds.left + bounds.width * 0.5;
    this._goText.y = bounds.top + bounds.height * 0.5;

    this._scoreGroup.x = bounds.right - 300;
    this._scoreGroup.y = bounds.top + 70;

    this._roundGroup.x = bounds.left + bounds.width * 0.5;
    this._roundGroup.y = bounds.top + 70;

    this._boosterGroup.x = bounds.left + 300;
    this._boosterGroup.y = bounds.top + 70;

    this._newRoundText.x = bounds.left + bounds.width * 0.5;
    this._newRoundText.y = bounds.top + bounds.height * 0.5;

    this._tutorial.x = bounds.left + bounds.width * 0.5;
    this._tutorial.y = bounds.top + bounds.height * 0.8;

    if (SCENE_CONFIG.isMobile) {
      if (window.innerWidth < window.innerHeight) {
        this._scoreGroup.x = bounds.left + bounds.width * 0.7 - 10;
        this._scoreGroup.y = bounds.top + 60;
  
        this._roundGroup.x = bounds.left + bounds.width * 0.3;
        this._roundGroup.y = bounds.top + 60;
  
        this._boosterGroup.x = bounds.left + bounds.width * 0.5;
        this._boosterGroup.y = bounds.top + 140;

        this._dPad.scale = 1;
        this._dPad.x = bounds.right - 200;
        this._dPad.y = bounds.bottom - 240;
      } else {
        this._dPad.scale = 1.5;
        this._dPad.x = bounds.right - 240;
        this._dPad.y = bounds.bottom - 300;
      }
    }
  }
}
