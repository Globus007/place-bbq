import { isAshId, isBrickId, isDoorId } from "./parts";
import { complexWidthBricks } from "./layout";
import {
  CHIP_IDS,
  defaultWidths,
  emptyOn,
  snapHalf,
  WIDTH_RANGE,
  type ChipId,
  type StoveConfig,
  type StoveId,
  type StoveSpec,
} from "./types";

export const CATALOG: Record<StoveId, StoveSpec> = {
  bbq: {
    id: "bbq",
    name: "Барбекю",
    hint: "Линейный комплекс",
    defaultW: 8.5,
    defaultD: 3,
    minW: 2.5,
    maxW: 22,
    minD: 2.5,
    maxD: 4.5,
    rows: 36,
  },
};

export const DEFAULT_CONFIG: StoveConfig = {
  t: "bbq",
  w: 8.5,
  d: 3,
  on: {
    mangal: true,
    plate: true,
    rus: false,
    smoke: true,
    tandoor: false,
    sinkL: false,
    sinkR: false,
  },
  ws: defaultWidths(),
  pipe: "back",
  pipeKind: "new",
  fire: "room",
  brick: "vitebsk",
  door: "dt4",
  ash: "dp2",
  cook: "p19",
};

export function specOf(id: StoveId): StoveSpec {
  return CATALOG[id];
}

function clampW(id: ChipId, n: number) {
  const r = WIDTH_RANGE[id];
  return Math.min(r.max, Math.max(r.min, snapHalf(n)));
}

export function normalize(raw: StoveConfig): StoveConfig {
  const on = { ...emptyOn(), ...(raw.on ?? {}) };
  const ws = { ...defaultWidths(), ...(raw.ws ?? {}) };
  for (const id of CHIP_IDS) {
    on[id] = Boolean(on[id]);
    ws[id] = clampW(id, Number(ws[id] ?? WIDTH_RANGE[id].def));
  }
  if (!CHIP_IDS.some((id) => on[id])) on.mangal = true;
  const next: StoveConfig = {
    t: "bbq",
    w: 0,
    d: 3,
    on,
    ws,
    pipe: raw.pipe === "side" ? "side" : "back",
    pipeKind: raw.pipeKind === "kanal" ? "kanal" : "new",
    fire: raw.fire === "mason" ? "mason" : "room",
    brick: isBrickId(raw.brick) ? raw.brick : "vitebsk",
    door: isDoorId(raw.door) ? raw.door : "dt4",
    ash: isAshId(raw.ash) ? raw.ash : "dp2",
    cook: on.plate ? "p19" : "none",
  };
  next.w = complexWidthBricks(next);
  return next;
}
