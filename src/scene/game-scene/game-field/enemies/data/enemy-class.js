import Ghost from "../enemies-by-type/ghost";
import EvilPumpkin from "../enemies-by-type/evil-pumpkin";
import { ENEMY_TYPE } from "./enemy-data";
import Skeleton from "../enemies-by-type/skeleton";

const ENEMY_CLASS = {
  [ENEMY_TYPE.Ghost]: Ghost,
  [ENEMY_TYPE.EvilPumpkin]: EvilPumpkin,
  [ENEMY_TYPE.Skeleton]: Skeleton,
}

export default ENEMY_CLASS;
