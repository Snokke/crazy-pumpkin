import { CONSUMABLE_TYPE } from "../consumables/data/consumables-config";

const SCORE_CONFIG = {
  perSecond: [10, 20, 30, 40, 50],
  consumables: {
    [CONSUMABLE_TYPE.SmallCandy]: [100, 150, 200, 250, 300],
    [CONSUMABLE_TYPE.BigCandy]: [500, 750, 1000, 1250, 1500],
    [CONSUMABLE_TYPE.BoosterCandyPlayerSpeed]: [1000, 1500, 2000, 2500, 3000],
    [CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability]: [1000, 1500, 2000, 2500, 3000],
    [CONSUMABLE_TYPE.BoosterCandyEnemiesSlow]: [1000, 1500, 2000, 2500, 3000],
  },
}

export { SCORE_CONFIG };
