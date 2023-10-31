import * as THREE from "three";
import Loader from "../../../core/loader";
import Materials from "../../../core/materials";

export default class Environment extends THREE.Group {
  constructor() {
    super();

    this._init();
  }

  _init() {
    this._initEnvironment();
    this._initArch();
  }

  _initEnvironment() {
    const view = Loader.assets['environment'].scene.children[0].clone();
    this.add(view);

    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    view.material = material;

    const scale = 0.5;
    view.scale.set(scale, scale, scale);

    view.receiveShadow = true;
    view.castShadow = true;
  }

  _initArch() {
    const view = Loader.assets['arch'].scene.children[0].clone();
    this.add(view);

    const texture = Loader.assets['halloweenbits_texture'];
    texture.flipY = false;

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.3,
    });

    view.material = material;

    const scale = 0.5;
    view.scale.set(scale, scale, scale);

    view.castShadow = true;
  }
}
