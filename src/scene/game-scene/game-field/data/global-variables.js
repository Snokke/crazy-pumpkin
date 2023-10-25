import { GAME_STATE, MAP_TYPE } from "./game-data";

const GLOBAL_VARIABLES = {
  currentLevel: null,
  gameState: GAME_STATE.Idle,
  playerPosition: { row: 0, column: 0 },
  maps: {
    [MAP_TYPE.Consumable]: [],
    [MAP_TYPE.Obstacle]: [],
  }
}

export { GLOBAL_VARIABLES };
