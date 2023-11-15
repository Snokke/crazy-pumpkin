import * as THREE from "three";
import Loader from "../../../core/loader";
import Materials from "../../../core/materials";
import Fireflies from "./fireflies/fireflies";
import OrangePumpkin from "./environment-objects/orange-pumpkin";
import Scarecrow from "./environment-objects/scarecrow";
import Arch from "./arch";
import PostSkullLeft from "./environment-objects/post-skull/post-skull-left";
import PostSkullRight from "./environment-objects/post-skull/post-skull-right";
import { ENVIRONMENT_OBJECTS_TYPE } from "./environment-objects/data/environment-objects-type";
import { Black, MessageDispatcher } from "black-engine";
import { GLOBAL_VARIABLES } from "../game-field/data/global-variables";
import { GAME_STATE } from "../game-field/data/game-data";
import { SOUNDS_CONFIG } from "../../../core/configs/sounds-config";

export default class Environment extends THREE.Group {
  constructor(raycasterController, audioListener) {
    super();

    this.events = new MessageDispatcher();

    this._raycasterController = raycasterController;
    this._audioListener = audioListener;

    this._environmentView = null;
    this._arch = null;
    this._fireflies = null;
    this._orangePumpkin = null;
    this._scarecrow = null;
    this._leftPostSkull = null;
    this._rightPostSkull = null;
    this._clickSound = null;

    this._environmentObjects = {};
    this._pointerPosition = new THREE.Vector2();
    this._previousPointerPosition = new THREE.Vector2();
    this._isAllObjectIdle = true;

    this._globalVolume = SOUNDS_CONFIG.masterVolume;

    this._init();
  }

  update(dt) {
    this._fireflies.update(dt);
    this._updateEnvironmentObjects(dt);
    this._checkIntersection();

    this._previousPointerPosition.set(this._pointerPosition.x, this._pointerPosition.y);
  }

  setArchInvisible() {
    this._arch.setInvisible();
  }

  setArchVisible() {
    this._arch.setVisible();
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);
  }

  onPointerDown() {
    if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay) {
      return;
    }

    const intersect = this._raycasterController.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);

    if (intersect) {
      const type = intersect.object.userData['type'];

      if (type) {
        const object = this._environmentObjects[type];
        object.onClick();

        if (type === ENVIRONMENT_OBJECTS_TYPE.Pumpkin) {
          this._playSound(this._clickSound);
        }
      }
    }
  }

  onSoundChanged() {
    const clickVolume = SOUNDS_CONFIG.enabled ? SOUNDS_CONFIG.masterVolume * SOUNDS_CONFIG.clickSoundVolume : 0;
    this._clickSound.setVolume(clickVolume);
  }

  _checkIntersection() {
    if (GLOBAL_VARIABLES.gameState !== GAME_STATE.Gameplay || (this._isAllObjectIdle && this._pointerPosition.x === this._previousPointerPosition.x && this._pointerPosition.y === this._previousPointerPosition.y)) {
      return;
    }

    const intersect = this._raycasterController.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);

    if (intersect) {
      const type = intersect.object.userData['type'];

      if (type) {
        Black.engine.containerElement.style.cursor = 'pointer';
      }
    }
  }

  _updateEnvironmentObjects(dt) {
    for (let type in this._environmentObjects) {
      const object = this._environmentObjects[type];
      object.update(dt);
    }
  }

  _playSound(sound) {
    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();
  }

  _init() {
    this._initEnvironment();
    this._initArch();
    this._initOrangePumpkin();
    this._initScarecrow();
    this._initPostSkulls();
    this._initFireflies();
    this._initClickSound();
    this._initEnvironmentObjectsObject();
    this._addMeshesToRaycasterController();
    this._initSignals();
  }

  _initEnvironment() {
    const environmentView = this._environmentView = Loader.assets['environment'].scene.children[0].clone();
    this.add(environmentView);

    const material = Materials.getMaterial(Materials.type.HalloweenBits);
    environmentView.material = material;

    const scale = 0.5;
    environmentView.scale.set(scale, scale, scale);

    environmentView.receiveShadow = true;
    environmentView.castShadow = true;
  }

  _initArch() {
    const arch = this._arch = new Arch();
    this.add(arch);
  }

  _initOrangePumpkin() {
    const orangePumpkin = this._orangePumpkin = new OrangePumpkin();
    this.add(orangePumpkin);
  }

  _initScarecrow() {
    const scarecrow = this._scarecrow = new Scarecrow();
    this.add(scarecrow);
  }

  _initPostSkulls() {
    const leftPostSkull = this._leftPostSkull = new PostSkullLeft();
    this.add(leftPostSkull);

    const rightPostSkull = this._rightPostSkull = new PostSkullRight();
    this.add(rightPostSkull);
  }

  _initFireflies() {
    const fireflies = this._fireflies = new Fireflies();
    this.add(fireflies);
  }

  _initClickSound() {
    const clickSound = this._clickSound = new THREE.PositionalAudio(this._audioListener);
    this.add(clickSound);

    clickSound.setRefDistance(10);
    clickSound.setVolume(this._globalVolume * SOUNDS_CONFIG.clickSoundVolume);

    Loader.events.on('onAudioLoaded', () => {
      clickSound.setBuffer(Loader.assets['click']);
    });
  }

  _initEnvironmentObjectsObject() {
    this._environmentObjects = {
      [ENVIRONMENT_OBJECTS_TYPE.Pumpkin]: this._orangePumpkin,
      [ENVIRONMENT_OBJECTS_TYPE.Scarecrow]: this._scarecrow,
      [ENVIRONMENT_OBJECTS_TYPE.PostSkullLeft]: this._leftPostSkull,
      [ENVIRONMENT_OBJECTS_TYPE.PostSkullRight]: this._rightPostSkull,
    };
  }

  _addMeshesToRaycasterController() {
    const objects = [
      this._orangePumpkin,
      this._scarecrow,
      this._leftPostSkull,
      this._rightPostSkull,
    ];

    const meshes = [];

    objects.forEach(object => {
      meshes.push(object.getMesh());
    });

    meshes.push(this._environmentView);

    this._raycasterController.addMeshes(meshes);
  }

  _initSignals() {
    this._isObjectIdle = {};

    for (let type in this._environmentObjects) {
      this._isObjectIdle[type] = true;

      const object = this._environmentObjects[type];
      object.events.on('onIdle', (msg, type) => {
        this._isObjectIdle[type] = true;
        this._isAllObjectIdle = this._isAllObjectsIdle();
      });

      object.events.on('onMoving', (msg, type) => {
        this._isObjectIdle[type] = false;
        this._isAllObjectIdle = this._isAllObjectsIdle();
      });
    }

    this._isAllObjectIdle = this._isAllObjectsIdle();

    this._orangePumpkin.events.on('onEnvironmentPumpkinClick', () => this.events.post('onEnvironmentPumpkinClick'));
  }

  _isAllObjectsIdle() {
    let isAllObjectsIdle = true;

    for (let type in this._isObjectIdle) {
      if (!this._isObjectIdle[type]) {
        isAllObjectsIdle = false;
        break;
      }
    }

    return isAllObjectsIdle;
  }
}
