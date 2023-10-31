import * as THREE from "three";
import Materials from "../../../../core/materials";
import Loader from "../../../../core/loader";

export default class SimpleBoard extends THREE.Group {
  constructor() {
    super();

    this._init();
  }

  _init() {
    const view = Loader.assets['board'].scene.children[0].clone();
    this.add(view);

    // const material = Materials.getMaterial(Materials.type.HalloweenBits);
    // view.material = material;

    const texture = Loader.assets['halloweenbits_texture'];
    texture.flipY = false;

    const material = new THREE.MeshPhongMaterial({
      color: 0xe7e7e7,
      map: texture,
    });

    view.material = material;

    const scale = 0.5;
    view.scale.set(scale, scale, scale);

    view.receiveShadow = true;
  }
}
