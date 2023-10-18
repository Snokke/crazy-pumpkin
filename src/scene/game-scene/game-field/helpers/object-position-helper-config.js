import { GAME_OBJECT_TYPE } from "../data/game-field-config";

const OBJECT_POSITION_HELPER_CONFIG = {
  [GAME_OBJECT_TYPE.Player]: {
    color: 0x00aa00,
  },
  [GAME_OBJECT_TYPE.Enemy]: {
    color: 0xaa0000,
  },
  [GAME_OBJECT_TYPE.Obstacle]: {
    color: 0x444444,
  },
}

export { OBJECT_POSITION_HELPER_CONFIG };
