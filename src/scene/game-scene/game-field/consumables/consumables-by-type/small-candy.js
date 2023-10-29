import * as THREE from 'three';
import ConsumableAbstract from './consumable-abstract';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from '../data/consumables-config';

export default class SmallCandy extends ConsumableAbstract {
  constructor() {
    super();

    this._view = null;
    this._type = CONSUMABLE_TYPE.SmallCandy;
    this._config = CONSUMABLES_CONFIG[this._type];

    this._init();
  }

  _init() {
    const geometry = new THREE.IcosahedronGeometry(0.18, 0);
    const material = new THREE.MeshToonMaterial({ color: 0x00ff00 });
    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.castShadow = true;

    view.position.y = 0.3;
  }
}
