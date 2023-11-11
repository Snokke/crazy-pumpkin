import * as THREE from "three";
import Loader from "../../../core/loader";
import Materials from "../../../core/materials";
import Fireflies from "./fireflies/fireflies";

export default class Environment extends THREE.Group {
  constructor() {
    super();

    this._view = null;
    this._arch = null;
    this._fireflies = null;

    this._init();
  }

  update(dt) {
    this._fireflies.update(dt);
  }

  setArchInvisible() {
    this._arch.material.opacity = 0.3;
  }

  setArchVisible() {
    this._arch.material.opacity = 1;
  }

  _init() {
    this._initEnvironment();
    this._initArch();
    this._initFireflies();
  }

  _initEnvironment() {
    const view = this._view =  Loader.assets['environment'].scene.children[0].clone();
    this.add(view);

    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    view.material = material;

    const scale = 0.5;
    view.scale.set(scale, scale, scale);

    view.receiveShadow = true;
    view.castShadow = true;
  }

  _initArch() {
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

  _initFireflies() {
    const fireflies = this._fireflies = new Fireflies();
    this.add(fireflies);
  }
}
