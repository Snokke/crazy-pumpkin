import * as THREE from 'three';
import ConsumableAbstract from './consumable-abstract';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from '../data/consumables-config';
import Materials from '../../../../../core/materials';
import Loader from '../../../../../core/loader';

export default class BoosterCandyPlayerSpeed extends ConsumableAbstract {
  constructor() {
    super();

    this._type = CONSUMABLE_TYPE.BoosterCandyPlayerSpeed;
    this._config = CONSUMABLES_CONFIG[this._type];

    this._scale = 0.95;
    this._positionY = 0.3;

    this._init();
  }

  _init() {
    const view = Loader.assets['power-up-green'].scene.children[0].clone();
    this._viewGroup.add(view);

    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    view.material = material;

    view.rotation.x = Math.PI * 0.15;
    view.castShadow = true;
  }
}
