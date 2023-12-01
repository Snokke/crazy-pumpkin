import { OBSTACLE_TYPE } from "../obstacles/data/obstacles-config";

const LEVEL_CONFIG = {
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
}

export { LEVEL_CONFIG };
