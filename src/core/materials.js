import * as THREE from 'three';
import Loader from './loader';

export default class Materials {
  constructor() {

    this.halloweenBits = null;

    this._initMaterials();

    Materials.instance = this;
  }

  _initMaterials() {
    this._initHalloweenBitsTexture();
  }

  _initHalloweenBitsTexture() {
    const texture = Loader.assets['halloweenbits_texture'];
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    this.halloweenBits = new THREE.MeshPhongMaterial({
      map: texture,
    });

  }

  static getMaterial(type) {
    let material;

    switch (type) {
      case Materials.type.HalloweenBits:
        material = Materials.instance.halloweenBits;
        break;
    }

    return material;
  }
}

Materials.instance = null;

Materials.type = {
  HalloweenBits: 'HALLOWEEN_BITS',
};
