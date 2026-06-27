import { Search, MapPin, CalendarRange } from "lucide-react";
import { Button } from "../../components/ui";
import { todayISO } from "../../lib/utils";
import type { SearchParams } from "../../api/mock";

interface Props {
  value: SearchParams;
  onChange: (v: SearchParams) => void;
  onSearch: () => void;
}

export function SearchBar({ value, onChange, onSearch }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl2 bg-white p-2 shadow-lift sm:flex-row sm:items-center">
      <Field icon={<MapPin size={16} />} label="Dónde">
        <input
          value={value.city ?? ""}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          placeholder="Medellín, Cartagena…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
        />
      </Field>
      <div className="hidden h-9 w-px bg-ink/10 sm:block" />
      <Field icon={<CalendarRange size={16} />} label="Llegada">
        <input
          type="date"
          min={todayISO()}
          value={value.from ?? ""}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="w-full bg-transparent text-sm outline-none"
        />
      </Field>
      <div className="hidden h-9 w-px bg-ink/10 sm:block" />
      <Field icon={<CalendarRange size={16} />} label="Salida">
        <input
          type="date"
          min={value.from ?? todayISO()}
          value={value.to ?? ""}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="w-full bg-transparent text-sm outline-none"
        />
      </Field>
      <Button size="lg" onClick={onSearch} className="shrink-0">
        <Search size={17} /> Buscar
      </Button>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 hover:bg-paper-dim/60">
      <span className="text-moss-deep">{icon}</span>
      <span className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink/45">{label}</span>
        {children}
      </span>
    </label>
  );
}
