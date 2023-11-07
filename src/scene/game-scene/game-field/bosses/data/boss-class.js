import SkeletonBoss from "../skeleton-boss";
import { BOSS_TYPE } from "./boss-data";

const BOSS_CLASS = {
  [BOSS_TYPE.Skeleton]: SkeletonBoss,
}

export default BOSS_CLASS;