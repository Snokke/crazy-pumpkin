import BigCandy from "../consumables-by-type/big-candy";
import BoosterCandyEnemiesSlow from "../consumables-by-type/booster-candy-enemies-slow";
import BoosterCandyPlayerInvulnerability from "../consumables-by-type/booster-candy-player-invulnerability";
import BoosterCandyPlayerSpeed from "../consumables-by-type/booster-candy-player-speed";
import SmallCandy from "../consumables-by-type/small-candy";
import { CONSUMABLE_TYPE } from "./consumables-config";

const CONSUMABLE_CLASS = {
  [CONSUMABLE_TYPE.SmallCandy]: SmallCandy,
  [CONSUMABLE_TYPE.BigCandy]: BigCandy,
  [CONSUMABLE_TYPE.BoosterCandyPlayerSpeed]: BoosterCandyPlayerSpeed, 
  [CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability]: BoosterCandyPlayerInvulnerability, 
  [CONSUMABLE_TYPE.BoosterCandyEnemiesSlow]: BoosterCandyEnemiesSlow, 
}

export default CONSUMABLE_CLASS;
