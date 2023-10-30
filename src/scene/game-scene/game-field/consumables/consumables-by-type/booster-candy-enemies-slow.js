import * as THREE from 'three';
import ConsumableAbstract from './consumable-abstract';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from '../data/consumables-config';

export default class BoosterCandyEnemiesSlow extends ConsumableAbstract {
  constructor() {
    super();

    this._view = null;
    this._type = CONSUMABLE_TYPE.BoosterCandyEnemiesSlow;
    this._config = CONSUMABLES_CONFIG[this._type];

    this._init();
  }

  _init() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.castShadow = true;

    view.position.y = 0.3;
  }
}
