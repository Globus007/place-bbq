import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

export function exportStoveGlb(group: THREE.Object3D): Promise<Blob> {
  const clone = group.clone(true);
  clone.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }
  });
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      clone,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(new Blob([result], { type: "model/gltf-binary" }));
        } else {
          reject(new Error("GLB expected"));
        }
      },
      (err) => reject(err),
      { binary: true },
    );
  });
}
