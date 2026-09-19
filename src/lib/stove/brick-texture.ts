import * as THREE from "three";
import type { BrickPalette } from "./parts";

/** World size of one texture tile, metres (4 bricks × 14 courses). */
export const TEX_WORLD = { x: 1.02, y: 0.98 };

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function createBrickMaps(palette: BrickPalette, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context");

  const cols = 4;
  const rows = 14;
  const bw = size / cols;
  const bh = size / rows;
  const joint = Math.max(3, Math.round(size * 0.005));

  ctx.fillStyle = palette.mortar;
  ctx.fillRect(0, 0, size, size);

  const brickColors = palette.bricks;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 1 ? bw / 2 : 0;
    const y = r * bh;
    for (let c = -1; c <= cols; c++) {
      const x = c * bw + offset;
      const id = r * 17 + c * 13 + (offset ? 3 : 0);
      const fill = brickColors[Math.floor(hash(id) * brickColors.length)] ?? brickColors[0];
      const inset = joint / 2;
      const rx = x + inset;
      const ry = y + inset;
      const rw = bw - joint;
      const rh = bh - joint;
      ctx.fillStyle = fill;
      ctx.fillRect(rx, ry, rw, rh);

      const hi = ctx.createLinearGradient(rx, ry, rx, ry + rh);
      hi.addColorStop(0, "rgba(255,220,200,0.18)");
      hi.addColorStop(0.18, "rgba(255,220,200,0)");
      hi.addColorStop(0.78, "rgba(0,0,0,0)");
      hi.addColorStop(1, "rgba(40,10,8,0.22)");
      ctx.fillStyle = hi;
      ctx.fillRect(rx, ry, rw, rh);

      for (let k = 0; k < 18; k++) {
        const n = hash(id * 10 + k);
        ctx.fillStyle = `rgba(40,12,8,${0.04 + n * 0.08})`;
        ctx.fillRect(rx + n * rw, ry + hash(n + 2) * rh, 1 + n * 3, 1 + hash(n + 4) * 2);
      }
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;
  map.needsUpdate = true;

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext("2d");
  if (!bctx) throw new Error("2d context");
  bctx.fillStyle = "#888888";
  bctx.fillRect(0, 0, size, size);
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 1 ? bw / 2 : 0;
    const y = r * bh;
    for (let c = -1; c <= cols; c++) {
      const x = c * bw + offset;
      bctx.fillStyle = "#d8d8d8";
      bctx.fillRect(x + joint / 2, y + joint / 2, bw - joint, bh - joint);
    }
  }
  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.needsUpdate = true;

  return { map, bump };
}
