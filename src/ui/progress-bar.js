import { DisplayObject, Graphics } from "black-engine";
import TWEEN from 'three/addons/libs/tween.module.js';

export default class ProgressBar extends DisplayObject {
  constructor() {
    super();

    this._progressBar = null;
    this._progressBarTween = null;
  }

  show(color, width, duration) {
    this.visible = true;
    this.reset();
    
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
  }

  reset() {
    this._progressBarTween?.stop();
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
    progressBar.rect(0, 0, 100, 5);
    progressBar.fill();

    progressBar.alignAnchor(0, 0.5);
    progressBar.y = 29;
  }
}
