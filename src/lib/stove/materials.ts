import * as THREE from "three";
import { createBrickMaps, TEX_WORLD } from "./brick-texture";
import { BRICKS } from "./parts";
import type { BrickId } from "./types";

export type StoveMaterials = {
  brick: THREE.MeshStandardMaterial;
  brickDark: THREE.MeshStandardMaterial;
  pipe: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  metalSoft: THREE.MeshStandardMaterial;
  soot: THREE.MeshStandardMaterial;
  cooktop: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  ember: THREE.MeshStandardMaterial;
  maps: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture };
};

function triplanar(mat: THREE.MeshStandardMaterial) {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vWp;
        varying vec3 vWn;`,
      )
      .replace(
        "#include <fog_vertex>",
        `#include <fog_vertex>
        vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vWn = normalize(mat3(modelMatrix) * objectNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vWp;
        varying vec3 vWn;`,
      )
      .replace(
        "#include <map_fragment>",
        `
        #ifdef USE_MAP
          vec3 wn = abs(normalize(vWn));
          wn /= (wn.x + wn.y + wn.z + 1e-5);
          vec2 tw = vec2(${TEX_WORLD.x.toFixed(3)}, ${TEX_WORLD.y.toFixed(3)});
          vec4 tc =
              texture2D(map, vWp.zy / tw) * wn.x +
              texture2D(map, vWp.xz / tw) * wn.y +
              texture2D(map, vWp.xy / tw) * wn.z;
          diffuseColor *= tc;
        #endif
        `,
      );
  };
  mat.customProgramCacheKey = () => "place-brick-triplanar";
}

export function createMaterials(brickId: BrickId = "vitebsk"): StoveMaterials {
  const palette = BRICKS[brickId].palette;
  const maps = createBrickMaps(palette);

  const brick = new THREE.MeshStandardMaterial({
    map: maps.map,
    bumpMap: maps.bump,
    bumpScale: 0.012,
    roughness: 0.86,
    metalness: 0.02,
    color: 0xffffff,
  });
  triplanar(brick);

  const brickDark = brick.clone();
  brickDark.color = new THREE.Color(palette.dark);
  triplanar(brickDark);
  brickDark.customProgramCacheKey = () => "place-brick-triplanar-dark";
  brickDark.polygonOffset = true;
  brickDark.polygonOffsetFactor = -1;
  brickDark.polygonOffsetUnits = -2;

  const pipe = brick.clone();
  pipe.transparent = true;
  pipe.opacity = 0.42;
  pipe.depthWrite = false;
  pipe.roughness = 0.7;
  triplanar(pipe);

  const metal = new THREE.MeshStandardMaterial({
    color: 0x1c1c1e,
    metalness: 0.82,
    roughness: 0.38,
  });
  const metalSoft = new THREE.MeshStandardMaterial({
    color: 0x2a2a2c,
    metalness: 0.7,
    roughness: 0.5,
  });
  const soot = new THREE.MeshStandardMaterial({
    color: 0x0c0908,
    roughness: 1,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const cooktop = new THREE.MeshStandardMaterial({
    color: 0x1a1a1c,
    metalness: 0.9,
    roughness: 0.32,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x1a2a22,
    metalness: 0.15,
    roughness: 0.08,
    transparent: true,
    opacity: 0.38,
  });
  const ember = new THREE.MeshStandardMaterial({
    color: 0x3a1408,
    emissive: 0x6a2208,
    emissiveIntensity: 0.55,
    roughness: 1,
    metalness: 0,
  });

  return {
    brick,
    brickDark,
    pipe,
    metal,
    metalSoft,
    soot,
    cooktop,
    glass,
    ember,
    maps,
  };
}

export function disposeMaterials(m: StoveMaterials) {
  m.brick.dispose();
  m.brickDark.dispose();
  m.pipe.dispose();
  m.metal.dispose();
  m.metalSoft.dispose();
  m.soot.dispose();
  m.cooktop.dispose();
  m.glass.dispose();
  m.ember.dispose();
  m.maps.map.dispose();
  m.maps.bump.dispose();
}
