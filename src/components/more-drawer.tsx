import { Drawer } from "vaul";
import type { FireSide, PipeKind, PipePos, StoveConfig } from "@/lib/stove/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: StoveConfig;
  onChange: (partial: Partial<StoveConfig>) => void;
};

function Segment<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  const cols = options.length === 2 ? "grid-cols-2" : "grid-cols-3";
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <div role="radiogroup" aria-label={label} className={cn("grid gap-1 rounded-md bg-bg p-1", cols)}>
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.id)}
              className={cn(
                "h-12 rounded-sm px-2 text-sm font-medium transition-opacity duration-150",
                active ? "bg-primary text-primary-fg" : "bg-transparent text-fg",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MoreDrawer({ open, onOpenChange, config, onChange }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-fg/25" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-lg outline-none">
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
          <div className="flex flex-col gap-6 px-5 pb-6 pt-4">
            <Drawer.Title className="text-lg font-medium tracking-tight text-fg">Ещё параметры</Drawer.Title>

            <Segment<PipePos>
              label="Труба"
              value={config.pipe}
              onChange={(pipe) => onChange({ pipe })}
              options={[
                { id: "back", label: "Назад" },
                { id: "side", label: "Вбок" },
              ]}
            />

            <Segment<PipeKind>
              label="Оголовок"
              value={config.pipeKind}
              onChange={(pipeKind) => onChange({ pipeKind })}
              options={[
                { id: "new", label: "Новый" },
                { id: "kanal", label: "Короткий" },
              ]}
            />

            <Segment<FireSide>
              label="Фасад"
              value={config.fire}
              onChange={(fire) => onChange({ fire })}
              options={[
                { id: "room", label: "К площадке" },
                { id: "mason", label: "Печник" },
              ]}
            />

            <p className="text-xs text-subtle">Модули в одну кладку, стык — перевязка на кирпич. Нажмите элемент — меняется его ширина.</p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
