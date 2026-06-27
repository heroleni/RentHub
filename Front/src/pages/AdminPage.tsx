import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  Building2,
  Users,
  DollarSign,
  CalendarCheck,
  ShieldCheck,
  Download,
  Search,
  TrendingUp,
} from "lucide-react";
import { adminApi } from "../api/mock";
import { Button, Eyebrow, Card } from "../components/ui";
import { money } from "../lib/utils";
import type { AdminProperty } from "../lib/types";

// ── Static chart data (replace with real API data when available) ──────────
const REVENUE_DATA = [
  { m: "Ene", v: 3200 },
  { m: "Feb", v: 4100 },
  { m: "Mar", v: 3800 },
  { m: "Abr", v: 5200 },
  { m: "May", v: 6100 },
  { m: "Jun", v: 7400 },
];

const CITY_DATA = [
  { name: "Medellín", occ: 84 },
  { name: "Bogotá", occ: 91 },
  { name: "Cartagena", occ: 64 },
  { name: "Salento", occ: 52 },
  { name: "Sta. Marta", occ: 78 },
];

const PERIODS = ["Últimos 30 días", "Últimos 3 meses", "Este año"] as const;

// ── Sub-components ─────────────────────────────────────────────────────────
function KpiCard({
  icon,
  label,
  value,
  trend,
  negative = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  negative?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-ink/55">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss/10 text-moss-deep">
          {icon}
        </span>
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className={`mt-1 text-xs ${negative ? "text-coral" : "text-moss-deep"}`}>{trend}</p>
    </Card>
  );
}

function OccupancyBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const color =
    pct >= 75 ? "bg-moss" : pct >= 60 ? "bg-amber" : "bg-coral";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-dim">
        <span className={`block h-full ${color}`} style={{ width: `${pct}%` }} />
      </span>
      {pct}%
    </span>
  );
}

function StatusPill({ active, occ }: { active: boolean; occ: number }) {
  if (!active)
    return (
      <span className="inline-flex items-center rounded-full bg-paper-dim px-2.5 py-0.5 text-xs font-medium text-ink/50">
        Inactivo
      </span>
    );
  if (occ < 0.6)
    return (
      <span className="inline-flex items-center rounded-full bg-amber/15 px-2.5 py-0.5 text-xs font-medium text-amber">
        Baja ocupación
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-moss/15 px-2.5 py-0.5 text-xs font-medium text-moss-deep">
      Activo
    </span>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  });

  const { data: props } = useQuery({
    queryKey: ["admin-props"],
    queryFn: () => adminApi.getAllProperties(),
  });

  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(
    "Últimos 3 meses"
  );
  const [search, setSearch] = useState("");

  const filtered: AdminProperty[] = (props ?? []).filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.hostName.toLowerCase().includes(q)
    );
  });

  const exportXlsx = async () => {
    try {
      const blob = await adminApi.exportReport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inmuebles-renthub-${new Date().toISOString().slice(0, 10)}.xlsx`;
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
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Panel de administración</Eyebrow>
          <h1 className="font-display text-3xl font-bold">
            Visión global del sistema
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof PERIODS[number])}
            className="focusable rounded-full border border-ink/15 bg-white px-4 py-2 text-sm"
          >
            {PERIODS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <Button variant="outline" onClick={exportXlsx}>
            <Download size={16} /> Exportar Excel
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          icon={<Building2 size={18} />}
          label="Propiedades"
          value={String(stats?.totalProperties ?? "—")}
          trend="+1 este mes"
        />
        <KpiCard
          icon={<Users size={18} />}
          label="Usuarios"
          value={String(stats?.totalUsers ?? "—")}
          trend="+23 este mes"
        />
        <KpiCard
          icon={<DollarSign size={18} />}
          label="Ingresos totales"
          value={stats ? money(stats.totalRevenue) : "—"}
          trend="+18% vs periodo ant."
        />
        <KpiCard
          icon={<CalendarCheck size={18} />}
          label="Reservas activas"
          value={String(stats?.activeBookings ?? "—")}
          trend="+6 pts ocupación"
        />
        <KpiCard
          icon={<ShieldCheck size={18} />}
          label="KYC aprobados"
          value={String(stats?.kycApproved ?? "—")}
          trend={`${stats?.kycPending ?? 0} pendientes`}
          negative={(stats?.kycPending ?? 0) > 0}
        />
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Ocupación prom."
          value={
            props
              ? `${Math.round(
                  (props.reduce((s, p) => s + p.occupancyRate, 0) /
                    props.length) *
                    100
                )}%`
              : "—"
          }
          trend="Sobre el portafolio"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <p className="font-display font-semibold">Ingresos por mes</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ left: -18, top: 8 }}>
                <defs>
                  <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2FB67C" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2FB67C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E7EFEA"
                  vertical={false}
                />
                <XAxis
                  dataKey="m"
                  tick={{ fontSize: 12, fill: "#9DB3AB" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9DB3AB" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: unknown) => money(Number(v))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E7EFEA",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#1E8A5C"
                  strokeWidth={2.5}
                  fill="url(#adminGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-display font-semibold">Ocupación por ciudad</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CITY_DATA} margin={{ left: -22 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E7EFEA"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#9DB3AB" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9DB3AB" }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(v: unknown) => `${v}%`}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E7EFEA",
                  }}
                />
                <Bar dataKey="occ" fill="#5DCAA5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* All properties table */}
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display font-semibold">
            Todas las propiedades
          </p>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <input
              type="search"
              placeholder="Buscar por nombre, ciudad o anfitrión…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focusable w-64 rounded-full border border-ink/15 bg-white py-2 pl-8 pr-4 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3 font-medium">Inmueble</th>
                <th className="py-3 font-medium">Ciudad</th>
                <th className="py-3 font-medium">Anfitrión</th>
                <th className="py-3 font-medium">Tarifa</th>
                <th className="py-3 font-medium">Ocupación</th>
                <th className="py-3 font-medium">Noches</th>
                <th className="py-3 text-right font-medium">Ingresos</th>
                <th className="py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-ink/40"
                  >
                    Sin resultados para «{search}»
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-ink/5 last:border-0 hover:bg-paper-dim/40 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-dim">
                          <Building2 size={16} className="text-ink/50" />
                        </div>
                        <span className="font-medium">{p.title}</span>
                      </div>
                    </td>
                    <td className="py-3 text-ink/60">{p.city}</td>
                    <td className="py-3 text-ink/60">{p.hostName}</td>
                    <td className="py-3 text-ink/60">
                      {money(p.pricePerNight)}
                    </td>
                    <td className="py-3">
                      <OccupancyBar rate={p.occupancyRate} />
                    </td>
                    <td className="py-3 text-ink/60">{p.nightsBooked}</td>
                    <td className="py-3 text-right font-medium">
                      {money(p.monthlyRevenue)}
                    </td>
                    <td className="py-3">
                      <StatusPill active={p.isActive} occ={p.occupancyRate} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
