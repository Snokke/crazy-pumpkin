import { OBSTACLE_TYPE } from "../obstacle/data/obstacles-config";
import { DIRECTION } from "./game-field-config";

const LEVEL_TYPE = {
  Level001: 'LEVEL_001',
  Level002: 'LEVEL_002',
}

const LEVEL_CONFIG = {
  [LEVEL_TYPE.Level001]: {
    field: { rows: 8, columns: 8 },
    player: {
      startPosition: { row: 4, column: 3 },
      direction: DIRECTION.Right,
    },
    obstacles: [
      { type: OBSTACLE_TYPE.Tree, position: { row: 2, column: 3 } },
      { type: OBSTACLE_TYPE.Rock, position: { row: 3, column: 5 } },
    ],
  },
  [LEVEL_TYPE.Level002]: {
    field: { rows: 7, columns: 5 },
    player: {
      startPosition: { row: 1, column: 1 },
      direction: DIRECTION.Down,
    },
    obstacles: [
      { type: OBSTACLE_TYPE.Tree, position: { row: 3, column: 3 } },
      { type: OBSTACLE_TYPE.Rock, position: { row: 4, column: 2 } },
    ],
  },

}

export { LEVEL_TYPE, LEVEL_CONFIG };
