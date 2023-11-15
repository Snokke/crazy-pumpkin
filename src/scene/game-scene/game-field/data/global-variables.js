import { GHOSTS_COLOR_TYPE } from "../../environment/environment-objects/data/environment-objects-config";
import { GAME_STATE, MAP_TYPE } from "./game-data";

const GLOBAL_VARIABLES = {
  currentLevel: null,
  gameState: GAME_STATE.Idle,
  round: 0,
  playerPosition: { row: 0, column: 0 },
  playerLives: 3,
  activeBooster: null,
  boosterSpawned: false,
  ghostsColorType: GHOSTS_COLOR_TYPE.White,
  maps: {
    [MAP_TYPE.Consumable]: [],
    [MAP_TYPE.Obstacle]: [],
    [MAP_TYPE.Ghost]: [],
    [MAP_TYPE.EvilPumpkin]: [],
    [MAP_TYPE.Skeleton]: [],
  }
}

export { GLOBAL_VARIABLES };
