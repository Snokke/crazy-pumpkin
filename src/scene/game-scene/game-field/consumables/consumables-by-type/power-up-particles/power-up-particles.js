import * as THREE from 'three';
import powerUpParticlesVertexShader from './power-up-particles-shaders/power-up-particles-vertex-shader.glsl';
import powerUpParticlesFragmentShader from './power-up-particles-shaders/power-up-particles-fragment-shader.glsl';
import { POWERUP_PARTICLES_CONFIG, POWERUP_PARTICLES_STATE } from './power-up-particles-config';
import { CONSUMABLES_CONFIG } from '../../data/consumables-config';

export default class PowerUpParticles extends THREE.Group {
  constructor(type) {
    super();

    this._type = type;
    this._view = null;
    this._state = POWERUP_PARTICLES_STATE.Inactive;

    this._init();
  }

  update(dt) {
    if (this._state === POWERUP_PARTICLES_STATE.Inactive) {
      return;
    }

    const positions = this._view.geometry.attributes.position;
    const aAlpha = this._view.geometry.attributes.aAlpha;

    const topEdge = POWERUP_PARTICLES_CONFIG.spawnCube.position.y + (POWERUP_PARTICLES_CONFIG.spawnCube.size.y / 2);
    const bottomEdge = POWERUP_PARTICLES_CONFIG.spawnCube.position.y - (POWERUP_PARTICLES_CONFIG.spawnCube.size.y / 2);

    for (let i = 0; i < POWERUP_PARTICLES_CONFIG.count; i++) {
      const y = positions.getY(i);
      const deltaY = -POWERUP_PARTICLES_CONFIG.speed * dt;
      let newY = y - deltaY;

      if (newY > topEdge) {
        newY = bottomEdge;
        this._setParticleRandomStartPosition(positions, i);
      }

      positions.setY(i, newY);

      let newAlpha = aAlpha.getX(i);
      if (newY < bottomEdge + POWERUP_PARTICLES_CONFIG.alpha.bottomEdge) {
        newAlpha = (newY - bottomEdge) / POWERUP_PARTICLES_CONFIG.alpha.bottomEdge;
      } 

      if (newY > topEdge - POWERUP_PARTICLES_CONFIG.alpha.topEdge) {
        newAlpha = (topEdge - newY) / POWERUP_PARTICLES_CONFIG.alpha.topEdge;
      }

      aAlpha.setX(i, newAlpha);
    }

    positions.needsUpdate = true;
    aAlpha.needsUpdate = true;
  }

  show() {
    this._state = POWERUP_PARTICLES_STATE.Active;
    this.visible = true;
  }

  hide() {
    this._state = POWERUP_PARTICLES_STATE.Inactive;
    this.visible = false;
  }

  _setParticleRandomStartPosition(positions, i) {
    const spawnCubeConfig = POWERUP_PARTICLES_CONFIG.spawnCube; 
    const x = (Math.random() * spawnCubeConfig.size.x - spawnCubeConfig.size.x / 2) + spawnCubeConfig.position.x;
    const z = (Math.random() * spawnCubeConfig.size.z - spawnCubeConfig.size.z / 2) + spawnCubeConfig.position.z;

    positions.setX(i, x);
    positions.setZ(i, z);
  }

  _init() {
    this._initView();

    window.addEventListener('resize', () => this._onResize());
  }

  _initView() {
    const geometry = new THREE.BufferGeometry();

    const positionArray = new Float32Array(POWERUP_PARTICLES_CONFIG.count * 3);
    const scaleArray = new Float32Array(POWERUP_PARTICLES_CONFIG.count);
    const alphaArray = new Float32Array(POWERUP_PARTICLES_CONFIG.count);
    const spawnCubeConfig = POWERUP_PARTICLES_CONFIG.spawnCube;

    for (let i = 0; i < POWERUP_PARTICLES_CONFIG.count; i++) {
      positionArray[i * 3 + 0] = (Math.random() * spawnCubeConfig.size.x - spawnCubeConfig.size.x / 2) + spawnCubeConfig.position.x;
      positionArray[i * 3 + 1] = (Math.random() * spawnCubeConfig.size.y - spawnCubeConfig.size.y / 2) + spawnCubeConfig.position.y;
      positionArray[i * 3 + 2] = (Math.random() * spawnCubeConfig.size.z - spawnCubeConfig.size.z / 2) + spawnCubeConfig.position.z;
      scaleArray[i] = Math.min(Math.random(), 0.7);
      alphaArray[i] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphaArray, 1));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: POWERUP_PARTICLES_CONFIG.size },
        uColor: { value: new THREE.Color(CONSUMABLES_CONFIG[this._type].particlesColor) },
      },
      vertexShader: powerUpParticlesVertexShader,
      fragmentShader: powerUpParticlesFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const view = this._view = new THREE.Points(geometry, material);
    this.add(view);
  }

  _onResize() {
    this._view.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }
}
