import { ENEMY_TYPE } from "../enemies/data/enemy-data";

const GAME_CONFIG = {
  cellSize: 1,
  gravity: 9.8,
  sceneBlur: 5,
  helpers: false,
}

const ROUND_CONFIG = {
  maxRound: 4,
  roundDuration: 45000,
  player: [
    { speedMultiplier: 1 },
    { speedMultiplier: 1.1 },
    { speedMultiplier: 1.2 },
    { speedMultiplier: 1.3 },
    { speedMultiplier: 1.4 },
  ],
  enemies: {
    [ENEMY_TYPE.Ghost]: [
      { speedMultiplier: 1, maxCount: 4 },
      { speedMultiplier: 1.25, maxCount: 6 },
      { speedMultiplier: 1.5, maxCount: 8 },
      { speedMultiplier: 1.75, maxCount: 10 },
      { speedMultiplier: 2, maxCount: 12 },
    ],
    [ENEMY_TYPE.EvilPumpkin]: [
      { speedMultiplier: 1, count: 1 },
      { speedMultiplier: 1.1, count: 2 },
      { speedMultiplier: 1.2, count: 3 },
      { speedMultiplier: 1.3, count: 4 },
      { speedMultiplier: 1.4, count: 5 },
    ],
  }
}

export { GAME_CONFIG, ROUND_CONFIG };
