export const STOVE_IDS = ["bbq"] as const;

export type StoveId = (typeof STOVE_IDS)[number];
export type PipePos = "back" | "side";
export type PipeKind = "kanal" | "new";
export type FireSide = "room" | "mason";
export type BrickId = "vitebsk" | "straw" | "lode" | "baksteen";
export type DoorId = "dt3" | "dt4" | "dt6" | "dtg" | "kamin";
export type AshId = "dp2" | "dp1";
export type CookId = "none" | "p27" | "p19" | "kazan";

export const CHIP_IDS = [
  "mangal",
  "plate",
  "rus",
  "smoke",
  "tandoor",
  "sinkL",
  "sinkR",
] as const;

export type ChipId = (typeof CHIP_IDS)[number];
export type ModId = ChipId;

export const MOD_CHIPS: { key: ChipId; label: string }[] = [
  { key: "mangal", label: "Мангал" },
  { key: "plate", label: "Плита" },
  { key: "rus", label: "Русская печь" },
  { key: "smoke", label: "Коптильня" },
  { key: "tandoor", label: "Тандыр" },
  { key: "sinkL", label: "Мойка Л" },
  { key: "sinkR", label: "Мойка П" },
];

export const WIDTH_RANGE: Record<ChipId, { min: number; max: number; def: number }> = {
  mangal: { min: 2.5, max: 5, def: 3.5 },
  plate: { min: 2, max: 4.5, def: 3 },
  rus: { min: 4, max: 7, def: 5 },
  smoke: { min: 2, max: 4, def: 2.5 },
  tandoor: { min: 2, max: 3.5, def: 2.5 },
  sinkL: { min: 1.5, max: 4, def: 2.5 },
  sinkR: { min: 1.5, max: 4, def: 2.5 },
};

export type StoveConfig = {
  t: StoveId;
  w: number;
  d: number;
  on: Record<ChipId, boolean>;
  ws: Record<ChipId, number>;
  pipe: PipePos;
  pipeKind: PipeKind;
  fire: FireSide;
  brick: BrickId;
  door: DoorId;
  ash: AshId;
  cook: CookId;
};

export type StoveSpec = {
  id: StoveId;
  name: string;
  hint: string;
  defaultW: number;
  defaultD: number;
  minW: number;
  maxW: number;
  minD: number;
  maxD: number;
  rows: number;
};

export const MODULE_M = 0.255;
export const COURSE_M = 0.07;
export const JOINT_M = 0.12;
export const COUNTER_H = 0.85;
export const GRILL_H = 0.78;
export const SMOKE_H = 1.68;

export function planM(bricks: number) {
  return bricks * MODULE_M;
}

export function heightM(rows: number) {
  return rows * COURSE_M;
}

export function toMm(meters: number) {
  return Math.round(meters * 1000);
}

export function formatBricks(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function snapHalf(n: number) {
  return Math.round(n * 2) / 2;
}

export function isOn(cfg: StoveConfig, key: ChipId) {
  return cfg.on[key];
}

export function chipLabel(key: ChipId) {
  return MOD_CHIPS.find((c) => c.key === key)?.label ?? key;
}

export function emptyOn(): Record<ChipId, boolean> {
  return {
    mangal: false,
    plate: false,
    rus: false,
    smoke: false,
    tandoor: false,
    sinkL: false,
    sinkR: false,
  };
}

export function defaultWidths(): Record<ChipId, number> {
  return {
    mangal: 3.5,
    plate: 3,
    rus: 5,
    smoke: 2.5,
    tandoor: 2.5,
    sinkL: 2.5,
    sinkR: 2.5,
  };
}
