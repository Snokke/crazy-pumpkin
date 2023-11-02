import { Black, DisplayObject } from "black-engine";

export default class ScreenAbstract extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;
  }

  update(dt) { }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  onOverlayMove() {
    if (Black.engine.containerElement.style.cursor !== 'auto') {
      Black.engine.containerElement.style.cursor = 'auto';
    }
  }

  onAdded() {
    this._init();
    this.visible = false;

    Black.stage.on('resize', () => this._onResize());
    this._onResize();
  }

  _init() { }

  _onResize() { }
}
