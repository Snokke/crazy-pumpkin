import { GAME_CONFIG } from "../../scene/game-scene/game-field/data/game-config";
import { GLOBAL_VARIABLES } from "../../scene/game-scene/game-field/data/global-variables";
import { LEVEL_CONFIG } from "../../scene/game-scene/game-field/data/level-config";

export const deepCopyArray = (array) => {
  const newArray = [];

  for (let i = 0; i < array.length; i++) {
    newArray.push([...array[i]]);
  }

  return newArray;
}

export const isEqualsPositions = (position1, position2) => {
  return position1.row === position2.row && position1.column === position2.column;
}

export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomFromArray = (array) => {
  return array[randomBetween(0, array.length - 1)];
}

export const getCoordinatesFromPosition = (position) => {
  const cellSize = GAME_CONFIG.cellSize;
  const currentLevel = GLOBAL_VARIABLES.currentLevel;
  const fieldConfig = LEVEL_CONFIG[currentLevel].field;
  const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
  const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

  return { x, z };
}
