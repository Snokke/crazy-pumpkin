import { GAME_STATE, MAP_TYPE } from "./game-data";

const GLOBAL_VARIABLES = {
  currentLevel: null,
  gameState: GAME_STATE.Idle,
  round: 0,
  playerPosition: { row: 0, column: 0 },
  activeBooster: null,
  boosterSpawned: false,
  maps: {
    [MAP_TYPE.Consumable]: [],
    [MAP_TYPE.Obstacle]: [],
    [MAP_TYPE.Ghost]: [],
    [MAP_TYPE.EvilPumpkin]: [],
  }
}

export { GLOBAL_VARIABLES };
