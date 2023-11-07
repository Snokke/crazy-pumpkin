import * as THREE from 'three';
import BOSS_CLASS from './data/boss-class';
import { BOSS_TYPE } from './data/boss-data';

export default class BossesController extends THREE.Group {
  constructor() {
    super();

    this._activeBosses = [];
  }

  update(dt) {
    this._activeBosses.forEach(boss => {
      boss.update(dt);
    });
  }

  spawnBosses() {
    // this.spawn(BOSS_TYPE.Skeleton);
  }

  spawn(bossType) {
    const BossClass = BOSS_CLASS[bossType];
    const boss = new BossClass();
    this.add(boss);

    this._activeBosses.push(boss);
  }
}
