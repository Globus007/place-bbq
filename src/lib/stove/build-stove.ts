import * as THREE from "three";
import { pack } from "./layout";
import type { StoveMaterials } from "./materials";
import { ASHES, DOORS } from "./parts";
import {
  COUNTER_H,
  GRILL_H,
  SMOKE_H,
  type StoveConfig,
} from "./types";

function fireDoor(cfg: StoveConfig) {
  const d = DOORS[cfg.door];
  return { w: d.w / 1000, h: d.h / 1000, glass: d.glass };
}

function ashDoor(cfg: StoveConfig) {
  const d = ASHES[cfg.ash];
  return { w: d.w / 1000, h: d.h / 1000 };
}

function box(
  parent: THREE.Object3D,
  mat: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y0: number,
  z: number,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y0 + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addHandle(parent: THREE.Object3D, mat: THREE.Material, y: number, z: number, w: number) {
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, Math.max(0.08, w * 0.45), 10), mat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, y, z);
  bar.castShadow = true;
  parent.add(bar);
}

function addDoor(
  parent: THREE.Object3D,
  mats: StoveMaterials,
  opts: {
    x: number;
    y0: number;
    zFace: number;
    w: number;
    h: number;
    rotY?: number;
    kind: "fire" | "oven" | "ash" | "portal";
  },
) {
  const g = new THREE.Group();
  g.position.set(opts.x, 0, opts.zFace);
  g.rotation.y = opts.rotY ?? 0;
  parent.add(g);

  const frameT = opts.kind === "portal" ? 0.045 : 0.022;
  const depth = 0.03;
  box(g, mats.metal, opts.w, opts.h, depth, 0, opts.y0, depth / 2);

  const innerW = Math.max(0.08, opts.w - frameT * 2);
  const innerH = Math.max(0.08, opts.h - frameT * 2);
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(innerW, innerH, 0.02),
    opts.kind === "portal" ? mats.glass : mats.soot,
  );
  inner.position.set(0, opts.y0 + opts.h / 2, 0.006);
  g.add(inner);

  if (opts.kind === "fire" || opts.kind === "portal") {
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(innerW * 0.7, innerH * 0.18, 0.01),
      mats.ember,
    );
    glow.position.set(0, opts.y0 + frameT + innerH * 0.12, 0.012);
    g.add(glow);
  }

  if (opts.kind !== "portal") {
    addHandle(g, mats.metalSoft, opts.y0 + opts.h * 0.55, depth + 0.012, opts.w);
  }
}

function addPlinth(parent: THREE.Object3D, mats: StoveMaterials, W: number, D: number) {
  box(parent, mats.brickDark, W + 0.03, 0.07, D + 0.03, W / 2, 0, D / 2);
}

const FACE = 0.12;

type FaceHole = {
  x: number;
  w: number;
  y0: number;
  h: number;
  arched?: boolean;
  rise?: number;
};

function holeTop(h: FaceHole) {
  return h.y0 + h.h + (h.arched ? (h.rise ?? 0) : 0);
}

function addFaceWall(
  parent: THREE.Object3D,
  mat: THREE.Material,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  zFront: number,
  thick: number,
  holes: FaceHole[],
) {
  const shape = new THREE.Shape();
  shape.moveTo(x0, y0);
  shape.lineTo(x1, y0);
  shape.lineTo(x1, y1);
  shape.lineTo(x0, y1);
  shape.closePath();

  for (const hole of holes) {
    const hw = hole.w / 2;
    const hx0 = hole.x - hw;
    const hx1 = hole.x + hw;
    const hy0 = hole.y0;
    const hy1 = hole.y0 + hole.h;
    const path = new THREE.Path();
    if (hole.arched && (hole.rise ?? 0) > 0.01) {
      const rise = hole.rise ?? 0.14;
      const steps = 18;
      path.moveTo(hx0, hy0);
      path.lineTo(hx0, hy1);
      for (let i = 0; i <= steps; i++) {
        const xn = -1 + (2 * i) / steps;
        path.lineTo(hole.x + hw * xn, hy1 + rise * (1 - xn * xn));
      }
      path.lineTo(hx1, hy1);
      path.lineTo(hx1, hy0);
      path.closePath();
    } else {
      path.moveTo(hx0, hy0);
      path.lineTo(hx0, hy1);
      path.lineTo(hx1, hy1);
      path.lineTo(hx1, hy0);
      path.closePath();
    }
    shape.holes.push(path);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thick,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 1,
  });
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = zFront - thick;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addRoundCover(
  parent: THREE.Object3D,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  r: number,
) {
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.028, 20), mat);
  disc.rotation.x = Math.PI / 2;
  disc.position.set(x, y, z);
  disc.castShadow = true;
  parent.add(disc);
}

function addCavity(
  parent: THREE.Object3D,
  mats: StoveMaterials,
  hole: FaceHole,
  zFace: number,
  depth: number,
  wall: { x0: number; x1: number; y0: number; y1: number },
) {
  const innerH = holeTop(hole) - hole.y0;
  const backZ = zFace - depth + 0.02;
  box(parent, mats.soot, hole.w * 0.94, innerH * 0.92, 0.035, hole.x, hole.y0 + 0.012, backZ);
  const floorD = Math.max(0.06, depth - FACE - 0.04);
  box(parent, mats.soot, hole.w * 0.94, 0.02, floorD, hole.x, hole.y0 + 0.004, zFace - FACE - floorD / 2);

  const z0 = zFace - depth;
  const z1 = zFace - FACE;
  const d = z1 - z0;
  if (d < 0.008) return;
  const zc = (z0 + z1) / 2;
  const hx0 = hole.x - hole.w / 2;
  const hx1 = hole.x + hole.w / 2;
  const hy0 = hole.y0;
  const hy1 = holeTop(hole);
  const eps = 0.008;
  if (hx0 - wall.x0 > eps) {
    box(parent, mats.brick, hx0 - wall.x0, wall.y1 - wall.y0, d, (wall.x0 + hx0) / 2, wall.y0, zc);
  }
  if (wall.x1 - hx1 > eps) {
    box(parent, mats.brick, wall.x1 - hx1, wall.y1 - wall.y0, d, (hx1 + wall.x1) / 2, wall.y0, zc);
  }
  if (hy0 - wall.y0 > eps) {
    box(parent, mats.brick, hole.w, hy0 - wall.y0, d, hole.x, wall.y0, zc);
  }
  if (wall.y1 - hy1 > eps) {
    box(parent, mats.brick, hole.w, wall.y1 - hy1, d, hole.x, hy1, zc);
  }
}

function addCounterTop(
  inner: THREE.Group,
  mats: StoveMaterials,
  x0: number,
  w: number,
  D: number,
) {
  box(inner, mats.brickDark, w, 0.07, D + 0.06, x0 + w / 2, COUNTER_H - 0.02, D / 2 + 0.02);
}

function addHearthCabinet(
  inner: THREE.Group,
  mats: StoveMaterials,
  cfg: StoveConfig,
  x0: number,
  w: number,
  D: number,
) {
  const bodyY0 = 0.05;
  const cx = x0 + w / 2;
  box(inner, mats.brick, w, COUNTER_H - bodyY0, D - FACE, cx, bodyY0, (D - FACE) / 2);
  addFaceWall(inner, mats.brick, x0, x0 + w, bodyY0, COUNTER_H, D, FACE, []);
  const fire = fireDoor(cfg);
  const ash = ashDoor(cfg);
  const doorW = Math.min(fire.w, Math.max(0.22, w - 0.32));
  if (!fire.glass) {
    addDoor(inner, mats, {
      x: cx,
      y0: 0.1,
      zFace: D,
      w: Math.min(ash.w, doorW),
      h: ash.h,
      kind: "ash",
    });
  }
  addDoor(inner, mats, {
    x: cx,
    y0: fire.glass ? 0.16 : 0.12 + ash.h,
    zFace: D,
    w: doorW,
    h: fire.h,
    kind: fire.glass ? "portal" : "fire",
  });
  addCounterTop(inner, mats, x0, w, D);
}

function addCooktop(
  inner: THREE.Group,
  mats: StoveMaterials,
  cx: number,
  w: number,
  D: number,
) {
  const pw = Math.min(w * 0.9, 0.82);
  const pd = Math.min(D * 0.78, 0.56);
  box(inner, mats.cooktop, pw, 0.03, pd, cx, COUNTER_H + 0.04, D * 0.55);
  const r = Math.min(pw, pd) * 0.42;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.014, 36), mats.metalSoft);
  ring.position.set(cx, COUNTER_H + 0.058, D * 0.55);
  inner.add(ring);
  const mid = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r * 0.72, 0.012, 32), mats.metal);
  mid.position.set(cx, COUNTER_H + 0.062, D * 0.55);
  inner.add(mid);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.28, r * 0.28, 0.01, 24), mats.cooktop);
  cap.position.set(cx, COUNTER_H + 0.066, D * 0.55);
  inner.add(cap);
}

function buildSinkModule(
  inner: THREE.Group,
  mats: StoveMaterials,
  x0: number,
  w: number,
  D: number,
) {
  const bodyY0 = 0.05;
  const cavity = D * 0.42;
  const back = D - cavity;
  const cx = x0 + w / 2;
  box(inner, mats.brick, w, COUNTER_H - bodyY0, back, cx, bodyY0, back / 2);
  const hole: FaceHole = { x: cx, w: w * 0.72, y0: 0.12, h: 0.58 };
  addFaceWall(inner, mats.brick, x0, x0 + w, bodyY0, COUNTER_H, D, FACE, [hole]);
  addCavity(inner, mats, hole, D, cavity, { x0, x1: x0 + w, y0: bodyY0, y1: COUNTER_H });
  addCounterTop(inner, mats, x0, w, D);
  const basinW = Math.min(0.42, w * 0.55);
  const basinD = Math.min(0.32, D * 0.42);
  box(inner, mats.metal, basinW, 0.04, basinD, cx, COUNTER_H + 0.04, D * 0.58);
  box(inner, mats.metalSoft, basinW - 0.06, 0.07, basinD - 0.06, cx, COUNTER_H - 0.01, D * 0.58);
  const fx = cx - basinW * 0.12;
  const fz = D * 0.42;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 10), mats.metal);
  col.position.set(fx, COUNTER_H + 0.16, fz);
  col.castShadow = true;
  inner.add(col);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 8), mats.metal);
  spout.rotation.x = Math.PI / 2;
  spout.position.set(fx, COUNTER_H + 0.24, fz + 0.07);
  inner.add(spout);
}

function buildPlateModule(
  inner: THREE.Group,
  mats: StoveMaterials,
  cfg: StoveConfig,
  x0: number,
  w: number,
  D: number,
) {
  addHearthCabinet(inner, mats, cfg, x0, w, D);
  addCooktop(inner, mats, x0 + w / 2, w, D);
}

function buildTandoorModule(
  inner: THREE.Group,
  mats: StoveMaterials,
  x0: number,
  w: number,
  D: number,
) {
  const cx = x0 + w / 2;
  const H = 1.06;
  const R = Math.min(w * 0.4, 0.36);
  const z = Math.min(D - R - 0.03, D * 0.58);
  const innerR = R * 0.6;
  const pts = [
    new THREE.Vector2(innerR, 0.08),
    new THREE.Vector2(R, 0.08),
    new THREE.Vector2(R * 0.86, H),
    new THREE.Vector2(innerR * 0.72, H - 0.02),
    new THREE.Vector2(innerR, 0.16),
  ];
  const geo = new THREE.LatheGeometry(pts, 36);
  geo.computeVertexNormals();
  const shell = new THREE.Mesh(geo, mats.brick);
  shell.position.set(cx, 0, z);
  shell.castShadow = true;
  shell.receiveShadow = true;
  inner.add(shell);
  const lining = new THREE.Mesh(
    new THREE.CylinderGeometry(innerR * 0.92, innerR * 0.98, H * 0.72, 24, 1, true),
    mats.soot,
  );
  lining.position.set(cx, 0.16 + H * 0.36, z);
  inner.add(lining);
  const glow = new THREE.Mesh(new THREE.CylinderGeometry(innerR * 0.5, innerR * 0.5, 0.02, 16), mats.ember);
  glow.position.set(cx, 0.14, z);
  inner.add(glow);
  box(inner, mats.brickDark, w * 0.88, 0.08, w * 0.88, cx, 0, z);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(innerR * 0.9, innerR * 0.9, 0.03, 24), mats.metal);
  lid.position.set(cx + R * 0.55, H + 0.01, z);
  lid.rotation.z = 0.55;
  lid.castShadow = true;
  inner.add(lid);
  addDoor(inner, mats, {
    x: cx,
    y0: 0.16,
    zFace: z + R * 0.92,
    w: 0.13,
    h: 0.11,
    kind: "ash",
  });
}

function buildKaminModule(
  inner: THREE.Group,
  mats: StoveMaterials,
  cfg: StoveConfig,
  x0: number,
  w: number,
  D: number,
) {
  const bodyY0 = 0.05;
  const bodyH = 1.45;
  const cx = x0 + w / 2;
  const cavity = D * 0.55;
  const back = D - cavity;
  box(inner, mats.brick, w, bodyH - bodyY0, back, cx, bodyY0, back / 2);
  const portal: FaceHole = {
    x: cx,
    w: Math.min(w * 0.62, 0.72),
    y0: 0.16,
    h: 0.72,
    arched: true,
    rise: 0.22,
  };
  addFaceWall(inner, mats.brick, x0, x0 + w, bodyY0, bodyH, D, FACE, [portal]);
  addCavity(inner, mats, portal, D, cavity, { x0, x1: x0 + w, y0: bodyY0, y1: bodyH });
  box(inner, mats.brickDark, portal.w + 0.1, 0.07, 0.12, cx, 0.1, D + 0.02);
  box(inner, mats.brickDark, w + 0.04, 0.07, D + 0.04, cx, bodyH - 0.02, D / 2);
}

function buildRusModule(
  inner: THREE.Group,
  mats: StoveMaterials,
  cfg: StoveConfig,
  x0: number,
  w: number,
  D: number,
) {
  const bodyW = w;
  const cx = x0 + bodyW / 2;
  const bodyY0 = 0.05;
  const bodyH = 1.58;
  const cavity = D * 0.48;
  const back = D - cavity;
  box(inner, mats.brick, bodyW, bodyH - bodyY0, back, cx, bodyY0, back / 2);
  const mouth: FaceHole = {
    x: cx,
    w: bodyW * 0.46,
    y0: 0.7,
    h: 0.36,
    arched: true,
    rise: 0.18,
  };
  addFaceWall(inner, mats.brick, x0, x0 + bodyW, bodyY0, bodyH, D, FACE, [mouth]);
  addCavity(inner, mats, mouth, D, cavity, { x0, x1: x0 + bodyW, y0: bodyY0, y1: bodyH });
  box(inner, mats.brick, bodyW * 0.72, 0.08, 0.16, cx, 0.62, D + 0.02);
  box(inner, mats.brickDark, bodyW, 0.08, D + 0.04, cx, bodyH - 0.02, D / 2);
}

function buildMangalModule(
  inner: THREE.Group,
  mats: StoveMaterials,
  cfg: StoveConfig,
  x0: number,
  w: number,
  D: number,
) {
  const bodyY0 = 0.05;
  const cx = x0 + w / 2;
  const cavity = D * 0.45;
  const back = D - cavity;
  box(inner, mats.brick, w, COUNTER_H - bodyY0, back, cx, bodyY0, back / 2);

  const midW = Math.min(w * 0.62, 0.55);
  const lower: FaceHole = { x: cx, w: midW, y0: 0.12, h: 0.4, arched: true, rise: 0.14 };
  addFaceWall(inner, mats.brick, x0, x0 + w, bodyY0, COUNTER_H, D, FACE, [lower]);
  addCavity(inner, mats, lower, D, cavity, { x0, x1: x0 + w, y0: bodyY0, y1: COUNTER_H });
  addCounterTop(inner, mats, x0, w, D);

  const towerY0 = COUNTER_H - 0.02;
  const towerTop = COUNTER_H + GRILL_H;
  const grillCavity = D * 0.55;
  const towerBack = D - grillCavity;
  const towerW = w;
  box(inner, mats.brick, towerW, towerTop - towerY0, towerBack, cx, towerY0, towerBack / 2);
  const grillOpenW = Math.min(towerW * 0.72, towerW - 0.32);
  const rise = 0.2;
  const sill = 0.04;
  const crown = 0.065;
  const springH = Math.max(0.28, GRILL_H - sill - rise - crown);
  const grill: FaceHole = {
    x: cx,
    w: grillOpenW,
    y0: towerY0 + sill,
    h: springH,
    arched: true,
    rise,
  };
  addFaceWall(inner, mats.brick, x0, x0 + w, towerY0, towerTop, D, FACE, [grill]);
  addCavity(inner, mats, grill, D, grillCavity, {
    x0,
    x1: x0 + w,
    y0: towerY0,
    y1: towerTop,
  });
  const grateN = 5;
  for (let i = 0; i < grateN; i++) {
    const gz = towerBack + 0.08 + (i * (grillCavity - FACE - 0.1)) / (grateN - 1);
    box(inner, mats.metal, grillOpenW * 0.86, 0.012, 0.016, cx, towerY0 + 0.05, gz);
  }

  const chimH = 0.7;
  let chimX = cx;
  let chimZ = D * 0.38;
  if (cfg.pipe === "side") {
    chimX = cx + towerW * 0.12;
    chimZ = D * 0.42;
  }
  const chimW = w;
  const chimD = D * 0.62;
  const chimY0 = towerTop - 0.04;
  box(inner, mats.brick, chimW, chimH, chimD, chimX, chimY0, chimZ);
  const chimFront = chimZ + chimD / 2;
  addRoundCover(inner, mats.metal, chimX, chimY0 + chimH * 0.48, chimFront + 0.016, 0.055);
  box(inner, mats.brickDark, chimW, 0.08, chimD + 0.05, chimX, chimY0 + chimH - 0.02, chimZ);
  const extra = cfg.pipeKind === "kanal" ? 0.18 : 0.48;
  box(inner, mats.pipe, 0.28, extra, 0.28, chimX, chimY0 + chimH + 0.06, chimZ);
  box(inner, mats.metalSoft, 0.34, 0.03, 0.34, chimX, chimY0 + chimH + extra + 0.06, chimZ);
}

function buildSmokeModule(
  inner: THREE.Group,
  mats: StoveMaterials,
  x0: number,
  w: number,
  D: number,
) {
  const bodyY0 = 0.05;
  const cx = x0 + w / 2;
  box(inner, mats.brick, w, SMOKE_H - bodyY0, D - FACE, cx, bodyY0, (D - FACE) / 2);
  addFaceWall(inner, mats.brick, x0, x0 + w, bodyY0, SMOKE_H, D, FACE, []);
  const doorW = Math.min(0.32, w * 0.55);
  addDoor(inner, mats, {
    x: cx,
    y0: 0.42,
    zFace: D,
    w: doorW,
    h: 0.4,
    kind: "oven",
  });
  box(inner, mats.brickDark, w, 0.07, D + 0.04, cx, SMOKE_H - 0.02, D / 2);
}

export function buildStove(cfg: StoveConfig, mats: StoveMaterials): THREE.Group {
  const { modules, W } = pack(cfg);
  const D = cfg.d * 0.255;

  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner);

  addPlinth(inner, mats, W, D);

  for (const mod of modules) {
    if (mod.id === "sinkL" || mod.id === "sinkR") buildSinkModule(inner, mats, mod.x, mod.w, D);
    else if (mod.id === "plate") buildPlateModule(inner, mats, cfg, mod.x, mod.w, D);
    else if (mod.id === "mangal") buildMangalModule(inner, mats, cfg, mod.x, mod.w, D);
    else if (mod.id === "smoke") buildSmokeModule(inner, mats, mod.x, mod.w, D);
    else if (mod.id === "tandoor") buildTandoorModule(inner, mats, mod.x, mod.w, D);
    else buildRusModule(inner, mats, cfg, mod.x, mod.w, D);
  }

  inner.position.set(-W / 2, 0, -D / 2);

  if (cfg.fire === "mason") {
    root.rotation.y = Math.PI;
  }

  root.userData.exportable = true;
  return root;
}

export function disposeStove(group: THREE.Group) {
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
    }
  });
}
