import * as THREE from 'three';
import Loader from "../loader";

const boundingBox = new THREE.Box3();

export default class Utils {
  static createObject(name) {
    const object = Loader.assets[name];

    if (!object) {
      throw new Error(`Object ${name} is not found.`);
    }

    const group = new THREE.Group();
    const children = [...object.scene.children];

    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      group.add(child);
    }

    return group;
  }

  static getBoundingBox(target) {
    boundingBox.setFromObject(target);
    const size = boundingBox.getSize(new THREE.Vector3());

    return size;
  }

  static toQuads(geometry) {
    let p = geometry.parameters;
    let segmentsX = (geometry.type == "TorusBufferGeometry" ? p.tubularSegments : p.radialSegments) || p.widthSegments || p.thetaSegments || (p.points.length - 1) || 1;
    let segmentsY = (geometry.type == "TorusBufferGeometry" ? p.radialSegments : p.tubularSegments) || p.heightSegments || p.phiSegments || p.segments || 1;
    let indices = [];

    for (let i = 0; i < segmentsY + 1; i++) {
      let index11 = 0;
      let index12 = 0;
      
      for (let j = 0; j < segmentsX; j++) {
        index11 = (segmentsX + 1) * i + j;
        index12 = index11 + 1;
        let index21 = index11;
        let index22 = index11 + (segmentsX + 1);
        indices.push(index11, index12);

        if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) {
          indices.push(index21, index22);
        }
      }

      if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) {
        indices.push(index12, index12 + segmentsX + 1);
      }
    }

    geometry.setIndex(indices);
  }
}
