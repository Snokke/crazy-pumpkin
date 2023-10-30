import * as THREE from 'three';
import ConsumableAbstract from './consumable-abstract';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from '../data/consumables-config';

export default class BoosterCandyPlayerSpeed extends ConsumableAbstract {
  constructor() {
    super();

    this._view = null;
    this._type = CONSUMABLE_TYPE.BoosterCandyPlayerSpeed;
    this._config = CONSUMABLES_CONFIG[this._type];

    this._init();
  }

  _init() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.castShadow = true;

    view.position.y = 0.3;
  }
}
