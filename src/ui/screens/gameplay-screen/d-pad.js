import { Black, DisplayObject, Sprite } from "black-engine";

export default class DPad extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;
  }

  onAdded() {
    this._init();
  }

  _init() {
    const offset = 90;

    const arrowLeft = new Sprite('arrow');
    this.add(arrowLeft);
    arrowLeft.alignPivot();
    arrowLeft.rotation = Math.PI / 2;
    arrowLeft.x = -offset;
    arrowLeft.touchable = true;

    const arrowRight = new Sprite('arrow');
    this.add(arrowRight);
    arrowRight.alignPivot();
    arrowRight.rotation = -Math.PI / 2;
    arrowRight.x = offset;
    arrowRight.touchable = true;

    const arrowUp = new Sprite('arrow');
    this.add(arrowUp);
    arrowUp.alignPivot();
    arrowUp.rotation = Math.PI;
    arrowUp.y = -offset;
    arrowUp.touchable = true;

    const arrowDown = new Sprite('arrow');
    this.add(arrowDown);
    arrowDown.alignPivot();
    arrowDown.y = offset;
    arrowDown.touchable = true;

    arrowLeft.on('pointerDown', () => this.post('onLeft'));
    arrowRight.on('pointerDown', () => this.post('onRight'));
    arrowUp.on('pointerDown', () => this.post('onUp'));
    arrowDown.on('pointerDown', () => this.post('onDown'));
  }
}
