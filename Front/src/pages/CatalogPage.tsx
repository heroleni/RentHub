import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type SearchParams } from "../api/mock";
import { PropertyCard } from "../features/catalog/PropertyCard";
import { SearchBar } from "../features/catalog/SearchBar";
import { Eyebrow } from "../components/ui";
import { ShieldCheck } from "lucide-react";

export function CatalogPage() {
  const [draft, setDraft] = useState<SearchParams>({});
  const [active, setActive] = useState<SearchParams>({});

  const { data, isLoading } = useQuery({
    queryKey: ["properties", active],
    queryFn: () => api.searchProperties(active),
  });

  return (
    <div>
      {/* Hero — thesis: trust + verified stays */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(120%_80%_at_80%_-10%,#2FB67C_0%,transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-moss/40 bg-moss/10 px-3 py-1 text-xs font-medium text-moss-glow">
            <ShieldCheck size={14} /> Reservas con identidad verificada por IA
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
            Estancias donde todos
            <br />
            <span className="text-moss-glow">están verificados.</span>
          </h1>
          <p className="mt-4 max-w-lg text-paper/70">
            Explora libremente. Marca tus favoritos. Cuando decidas reservar,
            validamos identidades en segundos para que dueños y huéspedes
            duerman tranquilos.
          </p>

          <div className="mt-9 max-w-4xl">
            <SearchBar value={draft} onChange={setDraft} onSearch={() => setActive(draft)} />
          </div>
        </div>
      </section>

      {/* Catalog grid */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Eyebrow>Catálogo</Eyebrow>
            <h2 className="font-display text-2xl font-bold">
              {active.city ? `Resultados en "${active.city}"` : "Lugares destacados"}
            </h2>
          </div>
          <p className="text-sm text-ink/50">{data?.length ?? 0} inmuebles</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl2 bg-paper-dim" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="rounded-xl2 border border-dashed border-ink/15 py-20 text-center">
            <p className="font-display text-lg">No encontramos lugares para esa búsqueda.</p>
            <p className="mt-1 text-sm text-ink/55">Prueba con otra ciudad o amplía tus fechas.</p>
          </div>
        )}
      </section>
    </div>
  );
}
