import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { TrendingUp, Percent, DollarSign, Download, Plus, Building2, X } from "lucide-react";
import { api } from "../api/mock";
import { http } from "../api/client";
import { Button, Eyebrow, Card } from "../components/ui";
import { money } from "../lib/utils";

const REVENUE = [
  { m: "Ene", v: 3200 }, { m: "Feb", v: 4100 }, { m: "Mar", v: 3800 },
  { m: "Abr", v: 5200 }, { m: "May", v: 6100 }, { m: "Jun", v: 7400 },
];
const PERIODS = ["Últimos 30 días", "Últimos 3 meses", "Este año"] as const;

// Imágenes SVG inline — funcionan sin conexión a internet
const PLACEHOLDER_IMAGES = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='528' viewBox='0 0 800 528'%3E%3Crect width='800' height='528' fill='%232C6E49'/%3E%3Ctext x='400' y='270' font-size='48' fill='%23ffffff' text-anchor='middle' font-family='Arial'%3E🏠%3C/text%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='528' viewBox='0 0 800 528'%3E%3Crect width='800' height='528' fill='%231A5C3A'/%3E%3Ctext x='400' y='270' font-size='48' fill='%23ffffff' text-anchor='middle' font-family='Arial'%3E🛏%3C/text%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='528' viewBox='0 0 800 528'%3E%3Crect width='800' height='528' fill='%23145A32'/%3E%3Ctext x='400' y='270' font-size='48' fill='%23ffffff' text-anchor='middle' font-family='Arial'%3E🌿%3C/text%3E%3C/svg%3E",
];

export function OwnerDashboardPage() {
  const queryClient = useQueryClient();
  const { data: props } = useQuery({ queryKey: ["owner"], queryFn: () => api.ownerProperties() });
  const [period, setPeriod] = useState<typeof PERIODS[number]>("Últimos 3 meses");
  const [filterId, setFilterId] = useState<string>("all");
  const [showPublish, setShowPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", city: "", country: "Colombia",
    pricePerNight: "", maxGuests: "2", beds: "1", baths: "1",
    tags: "",
  });

  const handlePublish = async () => {
    if (!form.title || !form.city || !form.pricePerNight) {
      setPublishError("Título, ciudad y precio son obligatorios.");
      return;
    }
    setPublishing(true);
    setPublishError(null);
    try {
      const tagsArray = form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await http.post("/api/owner/properties", {
        title: form.title,
        city: form.city,
        country: form.country,
        pricePerNight: parseFloat(form.pricePerNight),
        maxGuests: parseInt(form.maxGuests),
        beds: parseInt(form.beds),
        baths: parseInt(form.baths),
        images: PLACEHOLDER_IMAGES,
        tags: tagsArray,
      }, true);

      await queryClient.invalidateQueries({ queryKey: ["owner"] });
      await queryClient.invalidateQueries({ queryKey: ["properties"] });

      setShowPublish(false);
      setForm({
        title: "", city: "", country: "Colombia",
        pricePerNight: "", maxGuests: "2", beds: "1", baths: "1", tags: "",
      });
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "No se pudo publicar el inmueble.");
    } finally {
      setPublishing(false);
    }
  };

  const totalRevenue = (props ?? []).reduce((s, p) => s + p.monthlyRevenue, 0);
  const avgOccupancy = props?.length ? props.reduce((s, p) => s + p.occupancyRate, 0) / props.length : 0;
  const totalNights = (props ?? []).reduce((s, p) => s + p.nightsBooked, 0);

  const exportXlsx = async () => {
    try {
      const blob = await api.exportOwnerReport(filterId === "all" ? undefined : filterId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-renthub-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo descargar el reporte.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Panel de anfitrión</Eyebrow>
          <h1 className="font-display text-3xl font-bold">Rendimiento de tu portafolio</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof PERIODS[number])}
            className="focusable rounded-full border border-ink/15 bg-white px-4 py-2 text-sm"
          >
            {PERIODS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <Button variant="outline" onClick={exportXlsx}>
            <Download size={16} /> Exportar Excel
          </Button>
          <Button onClick={() => { setShowPublish(true); setPublishError(null); }}>
            <Plus size={16} /> Publicar inmueble
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Kpi icon={<DollarSign size={18} />} label="Ingresos" value={money(totalRevenue)} trend="+18% vs periodo anterior" />
        <Kpi icon={<Percent size={18} />} label="Ocupación promedio" value={`${Math.round(avgOccupancy * 100)}%`} trend="+6 pts" />
        <Kpi icon={<TrendingUp size={18} />} label="Noches reservadas" value={`${totalNights}`} trend={`${props?.length ?? 0} inmuebles activos`} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <p className="font-display font-semibold">Ingresos por mes</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE} margin={{ left: -18, top: 8 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2FB67C" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2FB67C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7EFEA" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#9DB3AB" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9DB3AB" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => money(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid #E7EFEA" }} />
                <Area type="monotone" dataKey="v" stroke="#1E8A5C" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-display font-semibold">Ocupación por inmueble</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(props ?? []).map((p) => ({ name: p.title.split(" ").slice(0, 2).join(" "), o: Math.round(p.occupancyRate * 100) }))} margin={{ left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7EFEA" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9DB3AB" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 12, fill: "#9DB3AB" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 12, border: "1px solid #E7EFEA" }} />
                <Bar dataKey="o" fill="#F2C14E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Inventory */}
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display font-semibold">Inventario</p>
          <div className="flex items-center gap-2">
            <select
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="focusable rounded-full border border-ink/15 px-3 py-1.5 text-sm"
            >
              <option value="all">Todo el portafolio</option>
              {(props ?? []).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={exportXlsx}><Download size={15} /> Reporte</Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3 font-medium">Inmueble</th>
                <th className="py-3 font-medium">Ciudad</th>
                <th className="py-3 font-medium">Tarifa</th>
                <th className="py-3 font-medium">Ocupación</th>
                <th className="py-3 font-medium">Noches</th>
                <th className="py-3 text-right font-medium">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {(props ?? []).map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0">
                  <td className="flex items-center gap-3 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-paper-dim"><Building2 size={16} className="text-ink/50" /></div>
                    <span className="font-medium">{p.title}</span>
                  </td>
                  <td className="py-3 text-ink/60">{p.city}</td>
                  <td className="py-3 text-ink/60">{money(p.pricePerNight)}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-dim">
                        <span className="block h-full bg-moss" style={{ width: `${p.occupancyRate * 100}%` }} />
                      </span>
                      {Math.round(p.occupancyRate * 100)}%
                    </span>
                  </td>
                  <td className="py-3 text-ink/60">{p.nightsBooked}</td>
                  <td className="py-3 text-right font-medium">{money(p.monthlyRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Publicar inmueble */}
      {showPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl2 bg-white shadow-lift p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">Publicar inmueble</h2>
              <button onClick={() => setShowPublish(false)} className="focusable rounded-full p-2 hover:bg-ink/5">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Título *">
                <input className="input" placeholder="Ej: Apartamento moderno en El Poblado" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ciudad *">
                  <input className="input" placeholder="Medellín" value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
                <Field label="País">
                  <input className="input" value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Precio / noche *">
                  <input className="input" type="number" min="1" placeholder="150000" value={form.pricePerNight}
                    onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} />
                </Field>
                <Field label="Huéspedes">
                  <input className="input" type="number" min="1" value={form.maxGuests}
                    onChange={(e) => setForm({ ...form, maxGuests: e.target.value })} />
                </Field>
                <Field label="Camas">
                  <input className="input" type="number" min="1" value={form.beds}
                    onChange={(e) => setForm({ ...form, beds: e.target.value })} />
                </Field>
              </div>
              <Field label="Tags (separados por coma)">
                <input className="input" placeholder="WiFi, Piscina, A/C" value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </Field>
            </div>

            {publishError && (
              <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{publishError}</p>
            )}

            <div className="mt-5 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowPublish(false)} disabled={publishing}>Cancelar</Button>
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing ? "Publicando..." : <><Plus size={16} /> Publicar</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink/55 uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Kpi({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-ink/55">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss/10 text-moss-deep">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-moss-deep">{trend}</p>
    </Card>
  );
}
