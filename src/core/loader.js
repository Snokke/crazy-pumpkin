import * as THREE from 'three';
import { AssetManager, GameObject, MessageDispatcher } from 'black-engine';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import SaveManager from './save-manager';

const textures = [
  'ghost_basecolor.jpg',
  'pumpkin002_basecolor.jpg',
  'pumpkin002_roughness.jpg',
  'pumpkin004_basecolor.jpg',
  'pumpkin004_roughness.jpg',
  'halloweenbits_texture.png',
  'grave_basecolor.jpg',
];

const models = [
  'ghost.glb',
  'player-pumpkin.glb',
  'evil-pumpkin.glb',
  'grave-01.glb',
  'grave-02.glb',
  'grave-03.glb',
  'grave-04.glb',
  'grave-05.glb',
  'candy-small.glb',
  'candy-big.glb',
  'power-up-yellow.glb',
  'power-up-blue.glb',
  'power-up-green.glb',
  'board.glb',
  'environment.glb',
  'arch.glb',
  'player-grave.glb',
  'environment-pumpkin.glb',
  'environment-scarecrow.glb',
  'environment-post-skull.glb',
  'minion.glb',
  // 'warrior.glb',
];

const images = [
  'overlay.png',
  'sound-icon.png',
  'sound-icon-mute.png',
  'arrow.png',
  'logo.png',
];

const sounds = [
  'music.mp3',
  'jump.mp3',
  'collect.mp3',
  'smash.mp3',
  'obstacle-fall.mp3',
  'death.mp3',
  'game-over.mp3',
  'click.mp3',
];

const fonts = [
  'halloween_spooky.ttf',
];

const loadingPercentElement = document.querySelector('.loading-percent');
let progressRatio = 0;
const blackAssetsProgressPart = 0;
let isSoundsLoaded = false; // eslint-disable-line no-unused-vars

export default class Loader extends GameObject {
  constructor() {
    super();

    Loader.assets = {};
    Loader.events = new MessageDispatcher();

    this._threeJSManager = new THREE.LoadingManager(this._onThreeJSAssetsLoaded, this._onThreeJSAssetsProgress);
    this._blackManager = new AssetManager();

    this._soundsCountLoaded = 0;

    const dataVersion = SaveManager.getInstance().versionData;

    if (dataVersion !== SaveManager.getInstance().saveVersion) {
      SaveManager.getInstance().clearAll();
    }

    this._loadBlackAssets();
  }

  _loadBlackAssets() {
    const imagesBasePath = '/assets/';

    images.forEach((textureFilename) => {
      const imageFullPath = `${imagesBasePath}${textureFilename}`;
      const imageName = textureFilename.replace(/\.[^/.]+$/, "");
      this._blackManager.enqueueImage(imageName, imageFullPath);
    });
    
    const fontsBasePath = '/fonts/';
    
    fonts.forEach((fontFilename) => {
      const fontFullPath = `${fontsBasePath}${fontFilename}`;
      const fontName = fontFilename.replace(/\.[^/.]+$/, "");
      this._blackManager.enqueueFont(fontName, fontFullPath);
    });

    this._blackManager.on('complete', this._onBlackAssetsLoaded, this);
    this._blackManager.on('progress', this._onBlackAssetsProgress, this);

    this._blackManager.loadQueue();
  }

  _onBlackAssetsProgress(item, progress) { // eslint-disable-line no-unused-vars
    // progressRatio = progress;

    // const percent = Math.floor(progressRatio * 100);
    // loadingPercentElement.innerHTML = `${percent}%`;
  }

  _onBlackAssetsLoaded() {
    this.removeFromParent();
    this._loadThreeJSAssets();
  }

  _loadThreeJSAssets() {
    this._loadTextures();
    this._loadModels();
    this._loadAudio();

    if (textures.length === 0 && models.length === 0 && sounds.length === 0) {
      this._onThreeJSAssetsLoaded();
    }
  }

  _onThreeJSAssetsLoaded() {
    setTimeout(() => {
      loadingPercentElement.innerHTML = `100%`;
      loadingPercentElement.classList.add('ended');

      setTimeout(() => {
        loadingPercentElement.style.display = 'none';
      }, 300);
    }, 450);


    setTimeout(() => {
      const customEvent = new Event('onLoad');
      document.dispatchEvent(customEvent);

      if (isSoundsLoaded) {
        Loader.events.post('onAudioLoaded');
      }
    }, 100);
  }

  _onThreeJSAssetsProgress(itemUrl, itemsLoaded, itemsTotal) {
    progressRatio = Math.min(blackAssetsProgressPart + (itemsLoaded / itemsTotal), 0.98);

    const percent = Math.floor(progressRatio * 100);
    loadingPercentElement.innerHTML = `${percent}%`;
  }

  _loadTextures() {
    const textureLoader = new THREE.TextureLoader(this._threeJSManager);

    const texturesBasePath = '/textures/';

    textures.forEach((textureFilename) => {
      const textureFullPath = `${texturesBasePath}${textureFilename}`;
      const textureName = textureFilename.replace(/\.[^/.]+$/, "");
      Loader.assets[textureName] = textureLoader.load(textureFullPath);
    });
  }

  _loadModels() {
    const gltfLoader = new GLTFLoader(this._threeJSManager);

    const modelsBasePath = '/models/';

    models.forEach((modelFilename) => {
      const modelFullPath = `${modelsBasePath}${modelFilename}`;
      const modelName = modelFilename.replace(/\.[^/.]+$/, "");
      gltfLoader.load(modelFullPath, (gltfModel) => this._onAssetLoad(gltfModel, modelName));
    });
  }

  _loadAudio() {
    const audioLoader = new THREE.AudioLoader(this._threeJSManager);

    const audioBasePath = '/audio/';

    sounds.forEach((audioFilename) => {
      const audioFullPath = `${audioBasePath}${audioFilename}`;
      const audioName = audioFilename.replace(/\.[^/.]+$/, "");
      audioLoader.load(audioFullPath, (audioBuffer) => {
        this._onAssetLoad(audioBuffer, audioName);

        this._soundsCountLoaded += 1;

        if (this._soundsCountLoaded === sounds.length) {
          isSoundsLoaded = true;
          Loader.events.post('onAudioLoaded');
        }
      });
    });
  }

  _onAssetLoad(asset, name) {
    Loader.assets[name] = asset;
  }
}
