import { GAME_OBJECT_TYPE } from "../data/game-data";

const OBJECT_POSITION_HELPER_CONFIG = {
  [GAME_OBJECT_TYPE.Player]: {
    color: 0x00aa00,
    y: 0.007,
  },
  [GAME_OBJECT_TYPE.Enemy]: {
    color: 0xaa0000,
    y: 0.003,
  },
  [GAME_OBJECT_TYPE.Obstacle]: {
    color: 0x444444,
    y: 0.005,
  },
}

export { OBJECT_POSITION_HELPER_CONFIG };
