import ConsumableAbstract from './consumable-abstract';
import { CONSUMABLES_CONFIG, CONSUMABLE_TYPE } from '../data/consumables-config';
import Materials from '../../../../../core/materials';
import Loader from '../../../../../core/loader';
import PowerUpParticles from './power-up-particles/power-up-particles';

export default class BoosterCandyPlayerSpeed extends ConsumableAbstract {
  constructor() {
    super();

    this._type = CONSUMABLE_TYPE.BoosterCandyPlayerSpeed;
    this._config = CONSUMABLES_CONFIG[this._type];

    this._scale = 0.95;
    this._positionY = 0.3;

    this._init();
  }

  update(dt) {
    this._particles.update(dt);
  }

  show() {
    super.show();
    this._particles.show();
  }

  hide() {
    super.hide();
    this._particles.hide();
  }

  _init() {
    this._initView();
    this._initParticles();
  }

  _initView() {
    const view = Loader.assets['power-up-green'].scene.children[0].clone();
    this._viewGroup.add(view);

    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    view.material = material;

    view.rotation.x = Math.PI * 0.15;
    view.castShadow = true;
    view.receiveShadow = true;
  }

  _initParticles() {
    const particles = this._particles = new PowerUpParticles(this._type);
    this.add(particles);
  }
}
