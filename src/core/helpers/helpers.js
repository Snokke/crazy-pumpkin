import { Black, Vector } from "black-engine";
import { GAME_CONFIG } from "../../scene/game-scene/game-field/data/game-config";
import SCENE_CONFIG from "../configs/scene-config";

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

export const lerp = (a, b, t) => {
  return a + (b - a) * t;
}

export const getCoordinatesFromPosition = (position) => {
  const cellSize = GAME_CONFIG.cellSize;
  const fieldConfig = GAME_CONFIG.field;
  const x = (-fieldConfig.columns * cellSize * 0.5 + cellSize * 0.5) + position.column * cellSize;
  const z = (-fieldConfig.rows * cellSize * 0.5 + cellSize * 0.5) + position.row * cellSize;

  return { x, z };
}

export const vector3ToBlackPosition = (vector3, renderer, camera) => {
  const dpr = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio)
  const width = renderer.getContext().canvas.width / dpr;
  const height = renderer.getContext().canvas.height / dpr;

  camera.updateMatrixWorld();

  vector3.project(camera);

  const globalPos = new Vector().copyFrom(vector3);

  globalPos.x = (globalPos.x + 1) * width / 2;
  globalPos.y = - (globalPos.y - 1) * height / 2;

  return Black.stage.worldTransformationInverted.transformVector(globalPos);
}
