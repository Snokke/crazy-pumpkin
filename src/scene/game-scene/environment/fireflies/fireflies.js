import * as THREE from 'three';
import firefliesVertexShader from './fireflies-shaders/fireflies-vertex-shader.glsl';
import firefliesFragmentShader from './fireflies-shaders/fireflies-fragment-shader.glsl';
import { FIREFLIES_CONFIG } from './fireflies-config';

export default class Fireflies extends THREE.Group {
  constructor() {
    super();

    this._fireflies = null;

    this._init();
  }

  update(dt) {
    this._fireflies.material.uniforms.uTime.value += dt;
  }

  _init() {
    this._initView();

    window.addEventListener('resize', () => this._onResize());
  }

  _initView() {
    const firefliesGeometry = new THREE.BufferGeometry();

    const positionArray = new Float32Array(FIREFLIES_CONFIG.count * 3);
    const scaleArray = new Float32Array(FIREFLIES_CONFIG.count);
    const spawnCubeConfig = FIREFLIES_CONFIG.spawnCube;

    for (let i = 0; i < FIREFLIES_CONFIG.count; i++) {
      positionArray[i * 3 + 0] = (Math.random() * spawnCubeConfig.size.x - spawnCubeConfig.size.x / 2) + spawnCubeConfig.position.x;
      positionArray[i * 3 + 1] = (Math.random() * spawnCubeConfig.size.y - spawnCubeConfig.size.y / 2) + spawnCubeConfig.position.y;
      positionArray[i * 3 + 2] = (Math.random() * spawnCubeConfig.size.z - spawnCubeConfig.size.z / 2) + spawnCubeConfig.position.z;
      scaleArray[i] = Math.random();
    }

    firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

    const firefliesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: FIREFLIES_CONFIG.size },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(FIREFLIES_CONFIG.color) },
      },
      vertexShader: firefliesVertexShader,
      fragmentShader: firefliesFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const fireflies = this._fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
    this.add(fireflies);
  }

  _onResize() {
    this._fireflies.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }
}
