import { Drawer } from "vaul";
import { complexRows } from "@/lib/stove/layout";
import {
  ASH_IDS,
  ASHES,
  BRICK_IDS,
  BRICKS,
  buildBom,
  DOOR_IDS,
  DOORS,
  formatByn,
} from "@/lib/stove/parts";
import type { AshId, BrickId, DoorId, StoveConfig } from "@/lib/stove/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: StoveConfig;
  onChange: (partial: Partial<StoveConfig>) => void;
};

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; title: string; hint: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <div className="flex flex-col gap-1">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex min-h-12 items-center justify-between rounded-md px-3 text-left",
                active ? "bg-primary text-primary-fg" : "bg-bg text-fg",
              )}
            >
              <span className="text-sm font-medium">{opt.title}</span>
              <span className={cn("text-xs", active ? "text-primary-fg/70" : "text-muted")}>{opt.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function KitDrawer({ open, onOpenChange, config, onChange }: Props) {
  const bom = buildBom(config, complexRows(config));
  const brick = BRICKS[config.brick];

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-fg/25" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-xl bg-surface shadow-lg outline-none">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />
          <div className="flex flex-col gap-6 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <div>
              <Drawer.Title className="text-lg font-medium tracking-tight text-fg">Состав</Drawer.Title>
              <p className="mt-1 text-sm text-muted">
                {brick.name} · {DOORS[config.door].name}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Кирпич</p>
              <div className="grid grid-cols-4 gap-2">
                {BRICK_IDS.map((id) => {
                  const item = BRICKS[id];
                  const active = config.brick === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onChange({ brick: id as BrickId })}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-md p-2",
                        active ? "bg-primary text-primary-fg" : "bg-bg text-fg",
                      )}
                    >
                      <span
                        className="block size-10 rounded-sm border border-border"
                        style={{ background: item.swatch }}
                      />
                      <span className="text-center text-xs leading-tight font-medium">{item.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Choice<DoorId>
              label="Дверца топки"
              value={config.door}
              onChange={(door) => onChange({ door })}
              options={DOOR_IDS.map((id) => ({
                id,
                title: DOORS[id].name,
                hint: `${DOORS[id].w}×${DOORS[id].h}`,
              }))}
            />

            {!DOORS[config.door].glass ? (
              <Choice<AshId>
                label="Поддувало"
                value={config.ash}
                onChange={(ash) => onChange({ ash })}
                options={ASH_IDS.map((id) => ({
                  id,
                  title: ASHES[id].name,
                  hint: ASHES[id].hint,
                }))}
              />
            ) : null}

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Смета</p>
              <ul className="divide-y divide-border rounded-md bg-bg px-3">
                {bom.lines.map((line) => (
                  <li key={line.name} className="flex items-baseline justify-between gap-3 py-2.5">
                    <a
                      href={line.url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 text-sm text-fg underline-offset-2 hover:underline"
                    >
                      {line.name}
                      <span className="mt-0.5 block text-xs text-muted">
                        {line.qty} × {formatByn(line.price)}
                      </span>
                    </a>
                    <span className="shrink-0 tabular-nums text-sm font-medium">
                      {formatByn(line.qty * line.price)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="flex items-baseline justify-between px-1 pt-1">
                <span className="text-sm text-muted">Ориентир</span>
                <span className="tabular-nums text-base font-medium">{formatByn(bom.total)}</span>
              </p>
              <p className="text-xs text-subtle">
                Каталог Печной центр, Минск. Цены для эскиза, не оферта. Шамот ША-8 — на футеровку топки.
              </p>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
