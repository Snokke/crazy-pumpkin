import { CONSUMABLE_TYPE } from "../consumables/data/consumables-config";
import { ENEMY_TYPE } from "../enemies/data/enemy-data";

const ROUND_TYPE = {
  Normal: 'NORMAL',
  Boss: 'BOSS',
  Bonus: 'BONUS',
}

const ROUNDS_CONFIG_ENEMIES_ID = {
  [ENEMY_TYPE.Ghost]: 0,
  [ENEMY_TYPE.EvilPumpkin]: 1,
  [ENEMY_TYPE.Skeleton]: 2,
}

const ROUNDS_CONFIG_CONSUMABLES_SCORE_ID = {
  [CONSUMABLE_TYPE.SmallCandy]: 0,
  [CONSUMABLE_TYPE.BigCandy]: 1,
  [CONSUMABLE_TYPE.BoosterCandyPlayerSpeed]: 2,
  [CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability]: 2,
  [CONSUMABLE_TYPE.BoosterCandyEnemiesSlow]: 2,
}

const SPEED_MULTIPLIERS = {
  player: { multiplier: 1.025, max: 2 },
  enemies: {
    [ENEMY_TYPE.Ghost]: { multiplier: 1.05, max: 3.5 },
    [ENEMY_TYPE.EvilPumpkin]: { multiplier: 1.04, max: 2 },
    [ENEMY_TYPE.Skeleton]: { multiplier: 1.05, max: 3 },
  },
}

export { ROUND_TYPE, ROUNDS_CONFIG_ENEMIES_ID, SPEED_MULTIPLIERS, ROUNDS_CONFIG_CONSUMABLES_SCORE_ID };
