import Ghost from "../enemies-by-type/ghost";
import SkeletonHand from "../enemies-by-type/skeleton-hand";
import { ENEMY_TYPE } from "./enemy-data";

const ENEMY_CLASS = {
  [ENEMY_TYPE.Ghost]: Ghost,
  [ENEMY_TYPE.SkeletonHand]: SkeletonHand,
}

export default ENEMY_CLASS;
