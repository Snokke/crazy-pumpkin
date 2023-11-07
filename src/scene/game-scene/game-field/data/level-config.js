import { OBSTACLE_TYPE } from "../obstacles/data/obstacles-config";
import { DIRECTION } from "./game-data";

const LEVEL_TYPE = {
  Level001: 'LEVEL_001',
  Level002: 'LEVEL_002',
}

const LEVEL_CONFIG = {
  [LEVEL_TYPE.Level001]: {
    field: { rows: 8, columns: 8 },
    player: {
      startPosition: { row: 4, column: 3 },
      direction: DIRECTION.Down,
    },
    obstacles: {
      randomMap: true,
      count: { min: 8, max: 10 },
      ignorePositions: [
        { row: 0, column: 3 },
        { row: 1, column: 3 },
        { row: 2, column: 3 },
        { row: 3, column: 3 },
        { row: 4, column: 3 },
        { row: 5, column: 3 },
        { row: 6, column: 3 },
        { row: 7, column: 3 },
        { row: 4, column: 4 },
        { row: 5, column: 4 },
        { row: 6, column: 4 },
        { row: 7, column: 4 },
      ],
      map: [
        { type: OBSTACLE_TYPE.TreeYellow, position: { row: 1, column: 1 } },
        { type: OBSTACLE_TYPE.TreeOrange, position: { row: 2, column: 5 } },
        { type: OBSTACLE_TYPE.TreeYellow, position: { row: 3, column: 4 } },
        { type: OBSTACLE_TYPE.TreeOrange, position: { row: 5, column: 2 } },
        { type: OBSTACLE_TYPE.TreeOrange, position: { row: 6, column: 6 } },
        { type: OBSTACLE_TYPE.TreeYellow, position: { row: 7, column: 0 } },
      ],
    },
  },
}

export { LEVEL_TYPE, LEVEL_CONFIG };
