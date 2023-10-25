import Candy from "../consumables-by-type/candy";
import SpeedCandy from "../consumables-by-type/speed-candy";
import { CONSUMABLE_TYPE } from "./consumables-config";

const CONSUMABLE_CLASS = {
  [CONSUMABLE_TYPE.Candy]: Candy,
  [CONSUMABLE_TYPE.SpeedCandy]: SpeedCandy, 
}

export default CONSUMABLE_CLASS;
