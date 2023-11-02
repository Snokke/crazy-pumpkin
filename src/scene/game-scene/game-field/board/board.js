import * as THREE from "three";
import Loader from "../../../../core/loader";

export default class Board extends THREE.Group {
  constructor() {
    super();

    this._init();
  }

  _init() {
    const view = Loader.assets['board'].scene.children[0].clone();
    this.add(view);
    
    const texture = Loader.assets['halloweenbits_texture'];
    texture.flipY = false;

    const material = new THREE.MeshPhongMaterial({
      color: 0xdfdfdf,
      map: texture,
    });

    view.material = material;

    const scale = 0.5;
    view.scale.set(scale, scale, scale);

    view.receiveShadow = true;
  }
}
