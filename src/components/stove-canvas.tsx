import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildStove, disposeStove } from "@/lib/stove/build-stove";
import { createMaterials, disposeMaterials, type StoveMaterials } from "@/lib/stove/materials";
import type { StoveConfig } from "@/lib/stove/types";

export type StoveCanvasHandle = {
  getStove: () => THREE.Group | null;
  getRenderer: () => THREE.WebGLRenderer | null;
};

type Props = {
  config: StoveConfig;
  handleRef: MutableRefObject<StoveCanvasHandle | null>;
};

export function StoveCanvas({ config, handleRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cfgRef = useRef(config);
  cfgRef.current = config;
  const buildRef = useRef(buildStove);
  buildRef.current = buildStove;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f1ec);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;

    const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.05, 40);
    camera.position.set(2.4, 1.7, 3.6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.6;
    controls.maxDistance = 10;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 0.9, 0);

    const hemi = new THREE.HemisphereLight(0xfff6ea, 0xcbbba8, 0.85);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff4e8, 1.45);
    key.position.set(3.4, 6.2, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 22;
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.035;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8eef5, 0.35);
    fill.position.set(-4, 2.4, -2.2);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(9, 72),
      new THREE.MeshStandardMaterial({ color: 0xe9e2d6, roughness: 0.94, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    let mats: StoveMaterials | null = createMaterials(cfgRef.current.brick);
    let stove: THREE.Group | null = null;
    let brickId = cfgRef.current.brick;

    const frame = () => {
      if (!stove) return;
      const box = new THREE.Box3().setFromObject(stove);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y * 0.85, size.z, 0.8);
      const dist = (maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360))) * 1.68;
      camera.position.set(center.x + dist * 0.2, center.y + dist * 0.26, center.z + dist * 0.96);
      controls.target.set(center.x, Math.max(0.4, center.y * 0.62), center.z);
      controls.update();
    };

    const rebuild = (cfg: StoveConfig) => {
      if (!mats) return;
      if (stove) {
        scene.remove(stove);
        disposeStove(stove);
        stove = null;
      }
      if (cfg.brick !== brickId) {
        disposeMaterials(mats);
        mats = createMaterials(cfg.brick);
        brickId = cfg.brick;
      }
      stove = buildRef.current(cfg, mats);
      scene.add(stove);
      frame();
    };

    rebuild(cfgRef.current);

    handleRef.current = {
      getStove: () => stove,
      getRenderer: () => renderer,
    };

    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(loop);

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    ro.observe(host);

    const onCfg = () => rebuild(cfgRef.current);
    host.addEventListener("place-rebuild", onCfg);

    return () => {
      handleRef.current = null;
      host.removeEventListener("place-rebuild", onCfg);
      renderer.setAnimationLoop(null);
      ro.disconnect();
      controls.dispose();
      if (stove) {
        scene.remove(stove);
        disposeStove(stove);
      }
      if (mats) disposeMaterials(mats);
      mats = null;
      scene.environment?.dispose();
      pmrem.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [handleRef]);

  useEffect(() => {
    hostRef.current?.dispatchEvent(new Event("place-rebuild"));
  }, [config, buildStove]);

  return <div ref={hostRef} className="absolute inset-0 bg-bg" />;
}
