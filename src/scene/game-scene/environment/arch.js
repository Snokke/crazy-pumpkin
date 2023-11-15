import * as THREE from 'three';
import Loader from '../../../core/loader';

export default class Arch extends THREE.Group {
  constructor() {
    super();

    this._view = null;

    this._init();
  }

  setInvisible() {
    this._arch.material.opacity = 0.3;
  }

  setVisible() {
    this._arch.material.opacity = 1;
  }

  _init() {
    const arch = this._arch = Loader.assets['arch'].scene.children[0].clone();
    this.add(arch);

    const texture = Loader.assets['halloweenbits_texture'];
    texture.flipY = false;

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
    });

    arch.material = material;

    const scale = 0.5;
    arch.scale.set(scale, scale, scale);

    arch.castShadow = true;
  }
}
