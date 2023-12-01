import { DIRECTION } from "./game-data";

const GAME_CONFIG = {
  field: { rows: 8, columns: 8 },
  cellSize: 1,
  playerStartPosition: {
    position: { row: 4, column: 3 },
    direction: DIRECTION.Down,
  },
  gravity: 9.8,
  sceneBlur: 5,
  helpers: false,
}

export { GAME_CONFIG };
