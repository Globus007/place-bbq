import { BrickWall, Copy, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { shareUrl, useStoveStore } from "@/lib/stove/config";
import {
  chipLabel,
  formatBricks,
  MOD_CHIPS,
  snapHalf,
  WIDTH_RANGE,
} from "@/lib/stove/types";
import { cn } from "@/lib/utils";
import { useArLaunch } from "./ar-launch";
import { KitDrawer } from "./kit-drawer";
import { MoreDrawer } from "./more-drawer";
import { StoveCanvas, type StoveCanvasHandle } from "./stove-canvas";
import { Button } from "./ui/button";

function SizeRow({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="tabular-nums text-lg font-medium leading-tight text-fg">
          {formatBricks(value)}
          <span className="ml-1 text-sm font-normal text-muted">{unit}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="surface"
          size="icon"
          aria-label={`${label} меньше`}
          disabled={value <= min}
          onClick={() => onChange(snapHalf(value - 0.5))}
          className="size-12 rounded-md"
        >
          <Minus className="size-5" strokeWidth={2} />
        </Button>
        <Button
          variant="surface"
          size="icon"
          aria-label={`${label} больше`}
          disabled={value >= max}
          onClick={() => onChange(snapHalf(value + 0.5))}
          className="size-12 rounded-md"
        >
          <Plus className="size-5" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

export function StoveApp() {
  const { config, selected, hydrate, tapChip, setWidth, patch } = useStoveStore();
  const [ready, setReady] = useState(false);
  const [more, setMore] = useState(false);
  const [kit, setKit] = useState(false);
  const canvas = useRef<StoveCanvasHandle | null>(null);
  const { launch } = useArLaunch({ canvas });
  const range = WIDTH_RANGE[selected];

  useEffect(() => {
    hydrate();
    setReady(true);
    try {
      if (!localStorage.getItem("place.kitSeen.v1")) {
        setKit(true);
        localStorage.setItem("place.kitSeen.v1", "1");
      }
    } catch {
      /* private mode */
    }
  }, [hydrate]);

  async function copyLink() {
    const url = shareUrl(config);
    try {
      await navigator.clipboard.writeText(url);
      toast("Ссылка скопирована");
    } catch {
      toast(url);
    }
  }

  return (
    <div className="relative isolate flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg">
      {ready ? <StoveCanvas config={config} handleRef={canvas} /> : <div className="absolute inset-0 bg-bg" />}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto">
          <p className="flex items-baseline gap-1 font-sans text-xl font-semibold tracking-tight">
            Place
            <span className="inline-block size-1.5 -translate-y-1 rounded-full bg-accent" />
          </p>
          <p className="text-xs text-muted">Барбекю-комплекс</p>
        </div>
        <div className="pointer-events-auto flex items-center gap-1">
          <Button variant="ghost" size="pill" onClick={() => setKit(true)} className="text-fg">
            <BrickWall className="size-4" strokeWidth={2} />
            Состав
          </Button>
          <Button variant="ghost" size="pill" onClick={() => setMore(true)} className="text-fg">
            <SlidersHorizontal className="size-4" strokeWidth={2} />
            Ещё
          </Button>
          <Button variant="surface" size="icon" aria-label="Копировать ссылку" onClick={copyLink} className="size-11">
            <Copy className="size-5" strokeWidth={2} />
          </Button>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-bg from-40% via-bg/90 to-transparent pt-16">
        <div className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-wrap justify-center gap-1.5">
            {MOD_CHIPS.map((m) => {
              const active = config.on[m.key];
              const focused = selected === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => tapChip(m.key)}
                  className={cn(
                    "h-10 shrink-0 rounded-full px-2.5 text-sm font-medium whitespace-nowrap transition-opacity duration-150",
                    active ? "bg-primary text-primary-fg" : "bg-surface text-fg border border-border",
                    focused && "ring-2 ring-fg ring-offset-2 ring-offset-bg",
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-surface/90 px-4 py-3">
            <SizeRow
              label={`Ширина · ${chipLabel(selected)}`}
              value={config.ws[selected]}
              unit="кирп."
              min={range.min}
              max={range.max}
              onChange={(n) => setWidth(selected, n)}
            />
          </div>

          <Button className="w-full" onClick={() => void launch()}>
            На участке
          </Button>
          <p className="text-center text-xs text-subtle">Эскиз размещения, не рабочий чертёж</p>
        </div>
      </div>

      <MoreDrawer open={more} onOpenChange={setMore} config={config} onChange={patch} />
      <KitDrawer open={kit} onOpenChange={setKit} config={config} onChange={patch} />
    </div>
  );
}
