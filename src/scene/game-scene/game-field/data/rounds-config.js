import { ENEMY_TYPE } from "../enemies/data/enemy-data";
import { ROUND_OBSTACLES_TYPE } from "../obstacles/data/obstacles-config";

const ROUND_TYPE = {
  Normal: 'NORMAL',
  Boss: 'BOSS',
  Bonus: 'BONUS',
}

const ROUNDS2_CONFIG = {
  0: {
    type: ROUND_TYPE.Normal,
    duration: 30000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    speedMultiplier2: [1, 1, 1, 1], // Player, Ghost, EvilPumpkin, Skeleton
    speedMultiplier: {
      player: 1,
      enemies: {
        [ENEMY_TYPE.Ghost]: 1,
        [ENEMY_TYPE.EvilPumpkin]: 1,
        [ENEMY_TYPE.Skeleton]: 1,
      }
    }
  }
}

const ROUNDS_CONFIG = {
  maxRound: 4,
  roundDuration: 30000,
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
      { speedMultiplier: 1.25, maxCount: 5 },
      { speedMultiplier: 1.5, maxCount: 7 },
      { speedMultiplier: 1.75, maxCount: 8 },
      { speedMultiplier: 2, maxCount: 10 },
    ],
    [ENEMY_TYPE.EvilPumpkin]: [
      { speedMultiplier: 1, count: 1 },
      { speedMultiplier: 1.1, count: 2 },
      { speedMultiplier: 1.2, count: 3 },
      { speedMultiplier: 1.3, count: 4 },
      { speedMultiplier: 1.4, count: 5 },
    ],
    [ENEMY_TYPE.Skeleton]: [
      { speedMultiplier: 1 },
      { speedMultiplier: 1.3 },
      { speedMultiplier: 1.6 },
      { speedMultiplier: 1.9 },
      { speedMultiplier: 2.2 },
    ],
  }
}

export { ROUNDS_CONFIG, ROUND_TYPE, ROUNDS2_CONFIG };
