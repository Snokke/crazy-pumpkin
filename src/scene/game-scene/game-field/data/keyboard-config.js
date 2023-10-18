const BUTTON_TYPE = {
  Left: 'LEFT',
  Right: 'RIGHT',
  Up: 'UP',
  Down: 'DOWN',
  Jump: 'JUMP',
}

const BUTTONS_CONFIG = {
  [BUTTON_TYPE.Left]: {
    keyCode: ['ArrowLeft', 'KeyA'],
  },
  [BUTTON_TYPE.Right]: {
    keyCode: ['ArrowRight', 'KeyD'],
  },
  [BUTTON_TYPE.Up]: {
    keyCode: ['ArrowUp', 'KeyW'],
  },
  [BUTTON_TYPE.Down]: {
    keyCode: ['ArrowDown', 'KeyS'],
  },
  [BUTTON_TYPE.Jump]: {
    keyCode: ['Space'],
  },
}

export { BUTTON_TYPE, BUTTONS_CONFIG };
