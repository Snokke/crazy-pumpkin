import { DisplayObject, Graphics } from "black-engine";
import TWEEN from 'three/addons/libs/tween.module.js';
import { ROUND_CONFIG } from "../scene/game-scene/game-field/data/game-config";
import { GLOBAL_VARIABLES } from "../scene/game-scene/game-field/data/global-variables";
import { GAME_STATE } from "../scene/game-scene/game-field/data/game-data";

export default class ProgressBar extends DisplayObject {
  constructor(useTween = true) {
    super();

    this._useTween = useTween;

    this._progressBar = null;
    this._progressBarTween = null;

    this._updateActive = false;
    this._roundTime = 0;

    this._color = null;
    this._width = null;
    this._duration = null;
  }

  update(dt) {
    if (this._useTween) {
      return;
    }

    if (this._updateActive && GLOBAL_VARIABLES.gameState === GAME_STATE.Gameplay) {
        this._roundTime += dt * 1000;

        const percent = 1 - this._roundTime / this._duration;
        this._updateProgressBar(percent, this._color, this._width);
  
        if (this._roundTime > ROUND_CONFIG.roundDuration) {
          this._updateActive = false;
          this._roundTime = 0;
          this.visible = false;
          this.post('complete');
        }
    }
  }

  show(color, width, duration) {
    this._color = color;
    this._width = width;
    this._duration = duration;

    this.visible = true;
    this.reset();
    
    if (this._useTween) {
      this._progressBar.x = -width * 0.5;

      const progress = { percent: 1 };
  
      this._progressBarTween = new TWEEN.Tween(progress)
        .to({ percent: 0 }, duration)
        .start()
        .onUpdate(() => {
          this._updateProgressBar(progress.percent, color, width);
        })
        .onComplete(() => {
          this.visible = false;
          this.post('complete');
        });
    } else {
      this._updateActive = true;
    }
  }

  reset() {
    this._progressBarTween?.stop();
    this._updateActive = false;
    this._roundTime = 0;

    if (!this._useTween) {
      this._updateProgressBar(1, this._color, this._width);
    }
  }

  _updateProgressBar(percent, color, width) {
    this._progressBar.clear();
    this._progressBar.beginPath();
    this._progressBar.fillStyle(color);
    this._progressBar.rect(0, 0, width * percent, 7);
    this._progressBar.fill();
  }


  onAdded() {
    this._init();
  }

  _init() {
    const progressBar = this._progressBar = new Graphics();
    this.add(progressBar);

    progressBar.beginPath();
    progressBar.fillStyle(0x000000);
    progressBar.rect(0, 0, 140, 7);
    progressBar.fill();

    progressBar.alignAnchor(0, 0.5);
    progressBar.y = 29;
  }
}
