import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin } from "lucide-react";
import { clsx } from "clsx";
import { api } from "../api/mock";
import { Eyebrow } from "../components/ui";
import { money, fmtDate, nightsBetween, CHECK_IN_HOUR, CHECK_OUT_HOUR } from "../lib/utils";
import type { BookingStatus } from "../lib/types";

const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-amber/15 text-amber" },
  confirmed: { label: "Confirmada", cls: "bg-moss/15 text-moss-deep" },
  completed: { label: "Completada", cls: "bg-ink/10 text-ink/60" },
  cancelled: { label: "Cancelada", cls: "bg-coral/15 text-coral" },
};

export function BookingsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => api.myBookings(),
  });

  const bookings = data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Eyebrow>Tus estancias</Eyebrow>
      <h1 className="font-display text-3xl font-bold">Mis reservas</h1>

      {isLoading && (
        <p className="mt-8 text-ink/55">Cargando tus reservas…</p>
      )}

      {isError && (
        <p className="mt-8 rounded-xl bg-coral/10 px-4 py-3 text-coral">
          No se pudieron cargar tus reservas: {error instanceof Error ? error.message : "error desconocido"}
        </p>
      )}

      {!isLoading && !isError && bookings.length === 0 && (
        <div className="mt-8 rounded-xl2 bg-white p-8 text-center shadow-card">
          <p className="font-display text-lg font-semibold">Aún no tienes reservas</p>
          <p className="mt-1 text-sm text-ink/55">
            Cuando reserves un lugar, aparecerá aquí con todos los detalles.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="flex flex-col gap-4 rounded-xl2 bg-white p-4 shadow-card sm:flex-row">
            <img src={b.image} alt={b.propertyTitle} className="h-40 w-full rounded-xl object-cover sm:h-auto sm:w-48" />
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-semibold">{b.propertyTitle}</h3>
                  <p className="flex items-center gap-1 text-sm text-ink/55"><MapPin size={13} /> {b.city}</p>
                </div>
                <span className={clsx("rounded-full px-3 py-1 text-xs font-medium", STATUS[b.status as BookingStatus].cls)}>
                  {STATUS[b.status as BookingStatus].label}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-ink/45">Llegada</p>
                  <p className="font-medium">{fmtDate(b.checkIn)}</p>
                  <p className="flex items-center gap-1 text-xs text-moss-deep"><Clock size={12} /> {CHECK_IN_HOUR}</p>
                </div>
                <div>
                  <p className="text-xs text-ink/45">Salida</p>
                  <p className="font-medium">{fmtDate(b.checkOut)}</p>
                  <p className="flex items-center gap-1 text-xs text-moss-deep"><Clock size={12} /> {CHECK_OUT_HOUR}</p>
                </div>
              </div>

              <div className="mt-auto flex items-end justify-between pt-3">
                <p className="text-sm text-ink/55">{nightsBetween(b.checkIn, b.checkOut)} noches · {b.guests} huéspedes</p>
                <p className="font-display text-lg font-bold">{money(b.total)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
