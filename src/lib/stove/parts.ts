import {
  heightM,
  planM,
  type AshId,
  type BrickId,
  type CookId,
  type DoorId,
  type StoveConfig,
} from "./types";

export const BRICK_IDS = ["vitebsk", "straw", "lode", "baksteen"] as const;
export const DOOR_IDS = ["dt3", "dt4", "dt6", "dtg", "kamin"] as const;
export const ASH_IDS = ["dp2", "dp1"] as const;
export const COOK_IDS = ["none", "p27", "p19", "kazan"] as const;

export type BrickPalette = {
  mortar: string;
  bricks: string[];
  dark: number;
};

export type BrickPart = {
  id: BrickId;
  name: string;
  short: string;
  hint: string;
  size: string;
  price: number;
  url: string;
  swatch: string;
  palette: BrickPalette;
};

export type DoorPart = {
  id: DoorId;
  name: string;
  hint: string;
  w: number;
  h: number;
  price: number;
  glass: boolean;
  url: string;
};

export type AshPart = {
  id: AshId;
  name: string;
  hint: string;
  w: number;
  h: number;
  price: number;
  url: string;
};

export type CookPart = {
  id: CookId;
  name: string;
  hint: string;
  w: number;
  d: number;
  rings: number;
  price: number;
  url: string;
};

export const BRICKS: Record<BrickId, BrickPart> = {
  vitebsk: {
    id: "vitebsk",
    name: "Витебский М200",
    short: "Красный",
    hint: "1-й цех, красный",
    size: "250×120×65",
    price: 1.15,
    url: "https://pcentr.by/magazin/kirpich/vitebskij-kirpich/",
    swatch: "#9a3b2f",
    palette: {
      mortar: "#C9BDB0",
      bricks: ["#9C4336", "#8E3B30", "#A84C3D", "#7A342A", "#B05645", "#934033"],
      dark: 0x4a3028,
    },
  },
  straw: {
    id: "straw",
    name: "Витебский солома",
    short: "Солома",
    hint: "Персик / жёлтый",
    size: "250×120×65",
    price: 1.35,
    url: "https://pcentr.by/magazin/kirpich/vitebskij-kirpich/",
    swatch: "#d4b896",
    palette: {
      mortar: "#D8D0C4",
      bricks: ["#E4D0A8", "#D7C197", "#EBD9B4", "#CDB58A", "#E0C8A0", "#D2B78C"],
      dark: 0x3d2a22,
    },
  },
  lode: {
    id: "lode",
    name: "Lode печной",
    short: "Lode",
    hint: "Тёмно-красный",
    size: "250×120×65",
    price: 2.4,
    url: "https://pcentr.by/magazin/kirpich/kirpich-pechnoj-lode/",
    swatch: "#6b2e24",
    palette: {
      mortar: "#B7AAA0",
      bricks: ["#6B2E24", "#5C261E", "#7A382C", "#4E2018", "#823F32", "#612820"],
      dark: 0x2a1814,
    },
  },
  baksteen: {
    id: "baksteen",
    name: "Baksteen ручной",
    short: "Ручной",
    hint: "Формовка, пёстрый",
    size: "240×115×65",
    price: 3.1,
    url: "https://pcentr.by/magazin/kirpich/kirpich-ruchnoj-formovki-baksteen/",
    swatch: "#a05a40",
    palette: {
      mortar: "#C4B8AA",
      bricks: ["#A05A40", "#8B4A36", "#C47A55", "#6E3A2C", "#B86848", "#9A5238"],
      dark: 0x3a241c,
    },
  },
};

export const DOORS: Record<DoorId, DoorPart> = {
  dt3: {
    id: "dt3",
    name: "ДТ-3 Восход",
    hint: "250×210, чугун",
    w: 250,
    h: 210,
    price: 66,
    glass: false,
    url: "https://pcentr.by/magazin/dveri-topochnie/",
  },
  dt4: {
    id: "dt4",
    name: "ДТ-4 Восход",
    hint: "250×280, чугун",
    w: 250,
    h: 280,
    price: 73.5,
    glass: false,
    url: "https://pcentr.by/magazin/dveri-topochnie/",
  },
  dt6: {
    id: "dt6",
    name: "ДТ-6А",
    hint: "282×240, крашеная",
    w: 282,
    h: 240,
    price: 192,
    glass: false,
    url: "https://pcentr.by/magazin/dveri-topochnie/",
  },
  dtg: {
    id: "dtg",
    name: "ДТГ-3К Карелия",
    hint: "Герметичная",
    w: 250,
    h: 210,
    price: 177,
    glass: false,
    url: "https://pcentr.by/magazin/dveri-topochnie/",
  },
  kamin: {
    id: "kamin",
    name: "Каминная со стеклом",
    hint: "Портал 420×500",
    w: 420,
    h: 500,
    price: 390,
    glass: true,
    url: "https://pcentr.by/magazin/kaminnyie-dveri/",
  },
};

export const ASHES: Record<AshId, AshPart> = {
  dp2: {
    id: "dp2",
    name: "ДП-2А",
    hint: "250×140, поддувало",
    w: 250,
    h: 140,
    price: 83.2,
    url: "https://pcentr.by/magazin/dverki-podduvalnie/",
  },
  dp1: {
    id: "dp1",
    name: "ДП-1",
    hint: "130×140, малая",
    w: 130,
    h: 140,
    price: 42,
    url: "https://pcentr.by/magazin/dverki-podduvalnie/",
  },
};

export const COOKS: Record<CookId, CookPart> = {
  none: {
    id: "none",
    name: "Без плиты",
    hint: "Только массив",
    w: 0,
    d: 0,
    rings: 0,
    price: 0,
    url: "https://pcentr.by/magazin/plity/",
  },
  p27: {
    id: "p27",
    name: "П2-7 Рубцовск",
    hint: "510×340, 2 конфорки",
    w: 510,
    d: 340,
    rings: 2,
    price: 114,
    url: "https://pcentr.by/magazin/plity/",
  },
  p19: {
    id: "p19",
    name: "П1-9 Рубцовск",
    hint: "510×340, 1 конфорка",
    w: 510,
    d: 340,
    rings: 1,
    price: 111,
    url: "https://pcentr.by/magazin/plity/",
  },
  kazan: {
    id: "kazan",
    name: "П1-5 под казан",
    hint: "512×512",
    w: 512,
    d: 512,
    rings: 1,
    price: 330,
    url: "https://pcentr.by/magazin/plity/",
  },
};

export const SHAMOT = {
  name: "ША-8 Боровичи",
  hint: "Футеровка топки",
  price: 2.2,
  url: "https://pcentr.by/magazin/kirpich-shamotnyij/",
};

export const DAMPER = {
  name: "Задвижка ЗВ-3 МТЗ",
  hint: "240×130, две шт.",
  price: 36,
  qty: 2,
  url: "https://pcentr.by/magazin/zadvijki/",
};

export const GRATE = {
  name: "Колосник 250×180 МТЗ",
  price: 24,
  url: "https://pcentr.by/magazin/reshetki/",
};

export const CLEANOUT = {
  name: "Дверка прочистная",
  price: 28,
  url: "https://pcentr.by/magazin/dverki-prochistnie/",
};

export function isBrickId(v: string): v is BrickId {
  return (BRICK_IDS as readonly string[]).includes(v);
}
export function isDoorId(v: string): v is DoorId {
  return (DOOR_IDS as readonly string[]).includes(v);
}
export function isAshId(v: string): v is AshId {
  return (ASH_IDS as readonly string[]).includes(v);
}
export function isCookId(v: string): v is CookId {
  return (COOK_IDS as readonly string[]).includes(v);
}

export function allowsCook(cfg: StoveConfig) {
  return cfg.on.plate;
}

export function estimateBricks(cfg: StoveConfig, rows: number) {
  const V = planM(cfg.w) * planM(cfg.d) * heightM(rows);
  const unit = 0.25 * 0.12 * 0.065;
  let fill = 0.12;
  if (cfg.on.mangal) fill += 0.12;
  if (cfg.on.plate) fill += 0.08;
  if (cfg.on.rus) fill += 0.18;
  if (cfg.on.smoke) fill += 0.08;
  if (cfg.on.tandoor) fill += 0.07;
  if (cfg.on.sinkL || cfg.on.sinkR) fill += 0.04;
  const facing = Math.round((V / unit) * fill);
  const fireclay = Math.round(36 + facing * 0.07);
  return { facing, fireclay };
}

export type BomLine = {
  name: string;
  hint: string;
  qty: number;
  price: number;
  url: string;
};

export function buildBom(cfg: StoveConfig, rows: number): { lines: BomLine[]; total: number } {
  const brick = BRICKS[cfg.brick];
  const door = DOORS[cfg.door];
  const ash = ASHES[cfg.ash];
  const { facing, fireclay } = estimateBricks(cfg, rows);
  const lines: BomLine[] = [
    { name: brick.name, hint: `${brick.size} · ${brick.hint}`, qty: facing, price: brick.price, url: brick.url },
    { name: SHAMOT.name, hint: SHAMOT.hint, qty: fireclay, price: SHAMOT.price, url: SHAMOT.url },
    { name: door.name, hint: door.hint, qty: 1, price: door.price, url: door.url },
  ];
  if (!door.glass) {
    lines.push({ name: ash.name, hint: ash.hint, qty: 1, price: ash.price, url: ash.url });
  }
  if (cfg.on.plate) {
    lines.push({
      name: COOKS.p19.name,
      hint: "Большая одноконфорочная",
      qty: 1,
      price: COOKS.p19.price,
      url: COOKS.p19.url,
    });
  }
  if (cfg.on.smoke) {
    lines.push({
      name: "ДТ-3 Восход",
      hint: "Дверца коптильни",
      qty: 1,
      price: 66,
      url: "https://pcentr.by/magazin/dveri-topochnie/",
    });
  }
  if (cfg.on.sinkL || cfg.on.sinkR) {
    lines.push({
      name: "Мойка нерж.",
      hint: "Столешница с мойкой",
      qty: Number(cfg.on.sinkL) + Number(cfg.on.sinkR),
      price: 180,
      url: "https://pcentr.by/",
    });
  }
  lines.push({
    name: DAMPER.name,
    hint: DAMPER.hint,
    qty: cfg.on.rus ? 2 : DAMPER.qty,
    price: DAMPER.price,
    url: DAMPER.url,
  });
  lines.push({
    name: GRATE.name,
    hint: "Чугун МТЗ",
    qty: Math.max(1, Number(cfg.on.plate) + Number(cfg.on.mangal)),
    price: GRATE.price,
    url: GRATE.url,
  });
  const cleanQty = 1 + Number(cfg.on.smoke) + Number(cfg.on.rus);
  lines.push({
    name: CLEANOUT.name,
    hint: "Ревизия каналов",
    qty: cleanQty,
    price: CLEANOUT.price,
    url: CLEANOUT.url,
  });
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  return { lines, total };
}

export function formatByn(n: number) {
  return `${n.toFixed(n >= 100 ? 0 : 2).replace(".", ",")} руб.`;
}
