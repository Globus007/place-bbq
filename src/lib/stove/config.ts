import { create } from "zustand";
import { DEFAULT_CONFIG, normalize } from "./catalog";
import { firstOn } from "./layout";
import { isAshId, isBrickId, isCookId, isDoorId } from "./parts";
import {
  CHIP_IDS,
  defaultWidths,
  emptyOn,
  WIDTH_RANGE,
  type ChipId,
  type StoveConfig,
} from "./types";

const STORAGE_KEY = "place.config.v6";

const WQ: Record<ChipId, string> = {
  mangal: "mw",
  plate: "pw",
  rus: "rw",
  smoke: "sw",
  tandoor: "tw",
  sinkL: "slw",
  sinkR: "srw",
};

function parseOn(q: URLSearchParams) {
  const raw = q.get("m");
  const on = emptyOn();
  if (raw) {
    const set = new Set(raw.split(",").map((s) => s.trim()));
    for (const id of CHIP_IDS) on[id] = set.has(id);
    if (set.has("sink")) on.sinkL = true;
    if (set.has("kazan")) on.plate = true;
    return { on };
  }
  return {};
}

function parseWidths(q: URLSearchParams) {
  const ws = defaultWidths();
  for (const id of CHIP_IDS) {
    const raw = q.get(WQ[id]);
    if (raw) ws[id] = Number(raw);
  }
  const legacyKazan = q.get("kw");
  if (legacyKazan && !q.get("pw")) ws.plate = Number(legacyKazan);
  return ws;
}

function serializeMods(cfg: StoveConfig) {
  return CHIP_IDS.filter((id) => cfg.on[id]).join(",");
}

export function parseSearch(search: string): StoveConfig | null {
  const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (![...q.keys()].length) return null;
  const brick = q.get("brick") ?? "";
  const door = q.get("door") ?? "";
  const ash = q.get("ash") ?? "";
  const cook = q.get("cook") ?? "";
  return normalize({
    ...DEFAULT_CONFIG,
    ...parseOn(q),
    ws: parseWidths(q),
    pipe: q.get("pipe") === "side" ? "side" : "back",
    pipeKind: q.get("pk") === "kanal" ? "kanal" : "new",
    fire: q.get("fire") === "mason" ? "mason" : "room",
    brick: isBrickId(brick) ? brick : "vitebsk",
    door: isDoorId(door) ? door : "dt4",
    ash: isAshId(ash) ? ash : "dp2",
    cook: isCookId(cook) ? cook : "p19",
  });
}

export function serializeSearch(cfg: StoveConfig): string {
  const q = new URLSearchParams();
  q.set("m", serializeMods(cfg));
  for (const id of CHIP_IDS) {
    if (cfg.ws[id] !== WIDTH_RANGE[id].def) q.set(WQ[id], String(cfg.ws[id]));
  }
  if (cfg.pipe !== "back") q.set("pipe", cfg.pipe);
  if (cfg.pipeKind !== "new") q.set("pk", cfg.pipeKind);
  if (cfg.fire !== "room") q.set("fire", cfg.fire);
  if (cfg.brick !== "vitebsk") q.set("brick", cfg.brick);
  if (cfg.door !== "dt4") q.set("door", cfg.door);
  if (cfg.ash !== "dp2") q.set("ash", cfg.ash);
  if (cfg.cook !== "p19" && cfg.cook !== "none") q.set("cook", cfg.cook);
  return q.toString();
}

function writeUrl(cfg: StoveConfig) {
  if (typeof window === "undefined") return;
  const qs = serializeSearch(cfg);
  const next = `${window.location.pathname}?${qs}${window.location.hash}`;
  const now = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== now) window.history.replaceState(null, "", next);
}

function loadLocal(): StoveConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw) as StoveConfig);
  } catch {
    return null;
  }
}

function saveLocal(cfg: StoveConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    /* quota / private mode */
  }
}

type Store = {
  config: StoveConfig;
  selected: ChipId;
  hydrated: boolean;
  hydrate: () => void;
  setConfig: (next: StoveConfig) => void;
  patch: (partial: Partial<StoveConfig>) => void;
  select: (id: ChipId) => void;
  tapChip: (id: ChipId) => void;
  setWidth: (id: ChipId, n: number) => void;
};

export const useStoveStore = create<Store>((set, get) => ({
  config: DEFAULT_CONFIG,
  selected: "mangal",
  hydrated: false,
  hydrate: () => {
    const fromUrl = parseSearch(window.location.search);
    const cfg = fromUrl ?? loadLocal() ?? DEFAULT_CONFIG;
    const next = normalize(cfg);
    saveLocal(next);
    writeUrl(next);
    set({ config: next, selected: firstOn(next), hydrated: true });
  },
  setConfig: (next) => {
    const cfg = normalize(next);
    saveLocal(cfg);
    writeUrl(cfg);
    const selected = firstOn(cfg, get().selected);
    set({ config: cfg, selected });
  },
  patch: (partial) => {
    get().setConfig({ ...get().config, ...partial });
  },
  select: (id) => set({ selected: id }),
  tapChip: (id) => {
    const { config, selected } = get();
    const on = { ...config.on };
    if (on[id] && selected === id) {
      on[id] = false;
    } else {
      on[id] = true;
    }
    const next = normalize({ ...config, on });
    saveLocal(next);
    writeUrl(next);
    set({ config: next, selected: next.on[id] ? id : firstOn(next) });
  },
  setWidth: (id, n) => {
    const { config } = get();
    get().setConfig({ ...config, ws: { ...config.ws, [id]: n } });
  },
}));

export function shareUrl(cfg: StoveConfig) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}?${serializeSearch(cfg)}`;
}
