import {
  CHIP_IDS,
  COURSE_M,
  COUNTER_H,
  GRILL_H,
  JOINT_M,
  MODULE_M,
  planM,
  SMOKE_H,
  snapHalf,
  type ChipId,
  type StoveConfig,
} from "./types";

export type Packed = {
  id: ChipId;
  x: number;
  w: number;
};

const PACK_ORDER: ChipId[] = [
  "sinkL",
  "plate",
  "mangal",
  "smoke",
  "tandoor",
  "rus",
  "sinkR",
];

export function moduleWidth(id: ChipId, cfg: StoveConfig) {
  return planM(cfg.ws[id]);
}

export function pack(cfg: StoveConfig): { modules: Packed[]; W: number } {
  const modules: Packed[] = [];
  let x = 0;
  for (const id of PACK_ORDER) {
    if (!cfg.on[id]) continue;
    const w = moduleWidth(id, cfg);
    if (modules.length) x -= JOINT_M;
    modules.push({ id, x, w });
    x += w;
  }
  if (!modules.length) {
    const w = moduleWidth("mangal", cfg);
    modules.push({ id: "mangal", x: 0, w });
    x = w;
  }
  return { modules, W: x };
}

export function complexWidthBricks(cfg: StoveConfig) {
  return snapHalf(pack(cfg).W / MODULE_M);
}

export function complexHeightM(cfg: StoveConfig) {
  const extra = cfg.pipeKind === "kanal" ? 0.18 : 0.48;
  let h = COUNTER_H;
  if (cfg.on.mangal) h = Math.max(h, COUNTER_H + GRILL_H + 0.72 + extra);
  if (cfg.on.smoke) h = Math.max(h, SMOKE_H);
  if (cfg.on.tandoor) h = Math.max(h, 1.15);
  if (cfg.on.rus) h = Math.max(h, 1.66);
  if (cfg.on.plate) h = Math.max(h, COUNTER_H + 0.1);
  if (cfg.on.sinkL || cfg.on.sinkR) h = Math.max(h, COUNTER_H);
  return h;
}

export function complexRows(cfg: StoveConfig) {
  return Math.round(complexHeightM(cfg) / COURSE_M);
}

export function firstOn(cfg: StoveConfig, prefer?: ChipId): ChipId {
  if (prefer && cfg.on[prefer]) return prefer;
  for (const id of CHIP_IDS) {
    if (cfg.on[id]) return id;
  }
  return "mangal";
}
