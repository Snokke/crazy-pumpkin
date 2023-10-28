import Ghost from "../enemies-by-type/ghost";
import EvilPumpkin from "../enemies-by-type/evil-pumpkin";
import { ENEMY_TYPE } from "./enemy-data";

const ENEMY_CLASS = {
  [ENEMY_TYPE.Ghost]: Ghost,
  [ENEMY_TYPE.EvilPumpkin]: EvilPumpkin,
}

export default ENEMY_CLASS;
