import * as THREE from 'three';
import ConsumableAbstract from './consumable-abstract';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from '../data/consumables-config';
import Loader from '../../../../../core/loader';
import Materials from '../../../../../core/materials';

export default class SmallCandy extends ConsumableAbstract {
  constructor() {
    super();

    this._type = CONSUMABLE_TYPE.SmallCandy;
    this._config = CONSUMABLES_CONFIG[this._type];

    this._scale = 0.75;

    this._init();
  }

  _init() {
    const view = Loader.assets['candy-small'].scene.children[0].clone();
    this._viewGroup.add(view);

    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    view.material = material;

    view.castShadow = true;
    view.receiveShadow = true;
  }
}
