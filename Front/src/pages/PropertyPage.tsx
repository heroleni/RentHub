import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, MapPin, Users, BedDouble, Bath, Heart, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import { api, favoritesApi } from "../api/mock";
import { Button, VerifyBadge } from "../components/ui";
import { money, nightsBetween, isAvailable, todayISO, CHECK_IN_HOUR, CHECK_OUT_HOUR } from "../lib/utils";
import { useAuth } from "../store/auth";
import { useWishlist } from "../store/wishlist";

export function PropertyPage() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { data: p } = useQuery({ queryKey: ["property", id], queryFn: () => api.getProperty(id) });

  const { user, kyc, requireAuth, openAuth } = useAuth();
  const { has, toggle } = useWishlist();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  if (!p) return <div className="mx-auto max-w-7xl px-5 py-20">Cargando…</div>;

  const saved = has(p.id);
  const nights = from && to ? nightsBetween(from, to) : 0;
  const available = from && to ? isAvailable(p.blockedRanges, from, to) : true;
  const subtotal = nights * p.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee;

  const handleReserve = async () => {
    if (!from || !to || !available || nights <= 0) return;
    // Deferred auth: only now do we ask the user to log in
    if (!requireAuth("book")) return;
    // First booking requires an approved KYC verdict
    if (kyc !== "approved") { nav("/kyc"); return; }

    setBooking(true);
    setBookingError(null);
    try {
      await api.createBooking({ propertyId: p.id, from, to, guests: 1 });
      // Refrescar la lista de reservas para que la nueva aparezca al navegar.
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      nav("/bookings");
    } catch (e) {
      setBookingError(e instanceof Error ? e.message : "No se pudo crear la reserva.");
    } finally {
      setBooking(false);
    }
  };

  const saveProperty = async () => {
    if (saved) {
      toggle(p.id);
      if (user) await favoritesApi.remove(p.id).catch(() => {});
      return;
    }
    if (!requireAuth("save")) return;
    toggle(p.id);
    await favoritesApi.add(p.id).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      {/* Title */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{p.title}</h1>
          <p className="mt-1 flex items-center gap-3 text-sm text-ink/60">
            <span className="flex items-center gap-1"><Star size={14} className="fill-amber text-amber" /> {p.rating} · {p.reviews} reseñas</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> {p.city}, {p.country}</span>
          </p>
        </div>
        <button
          onClick={saveProperty}
          className="focusable inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-ink/40"
        >
          <Heart size={16} className={clsx(saved && "fill-coral text-coral")} />
          {saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {/* Gallery */}
      <div className="mt-6 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <img src={p.images[activeImg]} alt={p.title} className="aspect-[4/3] w-full rounded-xl2 object-cover" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
          {p.images.map((src: string, i: number) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={clsx("focusable overflow-hidden rounded-xl", activeImg === i && "ring-2 ring-moss")}
            >
              <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Details */}
        <div>
          <div className="flex flex-wrap gap-5 border-b border-ink/10 pb-6 text-sm text-ink/70">
            <span className="flex items-center gap-2"><Users size={18} /> {p.guests} huéspedes</span>
            <span className="flex items-center gap-2"><BedDouble size={18} /> {p.beds} camas</span>
            <span className="flex items-center gap-2"><Bath size={18} /> {p.baths} baños</span>
          </div>

          <div className="flex items-center gap-3 py-6">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-moss/15 font-display font-bold text-moss-deep">
              {p.hostName[0]}
            </div>
            <div>
              <p className="text-sm font-medium">Anfitrión: {p.hostName}</p>
              <p className="text-xs text-ink/50">Identidad verificada · Superhost</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-ink/10 pt-6">
            {p.tags.map((t: string) => (
              <span key={t} className="rounded-full bg-paper-dim px-3 py-1.5 text-sm text-ink/70">{t}</span>
            ))}
          </div>

          <div className="mt-8 rounded-xl2 bg-ink/[0.03] p-5">
            <p className="flex items-center gap-2 font-medium"><ShieldCheck size={18} className="text-moss-deep" /> Política de horarios estándar</p>
            <p className="mt-1 text-sm text-ink/60">
              Check-in a las {CHECK_IN_HOUR} · Check-out a las {CHECK_OUT_HOUR}. Aplicada automáticamente a toda reserva confirmada.
            </p>
          </div>
        </div>

        {/* Booking widget */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl2 bg-white p-6 shadow-lift">
            <p className="font-display text-2xl font-bold">
              {money(p.pricePerNight)} <span className="text-base font-normal text-ink/55">/ noche</span>
            </p>

            <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-ink/15">
              <label className="border-r border-ink/15 p-3">
                <span className="text-[10px] font-medium uppercase tracking-wide text-ink/45">Llegada</span>
                <input type="date" min={todayISO()} value={from} onChange={(e) => setFrom(e.target.value)}
                  className="block w-full bg-transparent text-sm outline-none" />
              </label>
              <label className="p-3">
                <span className="text-[10px] font-medium uppercase tracking-wide text-ink/45">Salida</span>
                <input type="date" min={from || todayISO()} value={to} onChange={(e) => setTo(e.target.value)}
                  className="block w-full bg-transparent text-sm outline-none" />
              </label>
            </div>

            {from && to && !available && (
              <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">
                Esas fechas ya están reservadas. Elige otro rango disponible.
              </p>
            )}

            {nights > 0 && available && (
              <div className="mt-4 space-y-2 text-sm">
                <Row label={`${money(p.pricePerNight)} × ${nights} noches`} value={money(subtotal)} />
                <Row label="Tarifa de servicio" value={money(serviceFee)} />
                <div className="border-t border-ink/10 pt-2">
                  <Row label="Total" value={money(total)} strong />
                </div>
              </div>
            )}

            <Button size="lg" className="mt-5 w-full" disabled={!from || !to || !available || nights <= 0 || booking} onClick={handleReserve}>
              {booking ? "Reservando..." : "Reservar"}
            </Button>

            {bookingError && (
              <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{bookingError}</p>
            )}

            {!user && (
              <p className="mt-3 text-center text-xs text-ink/50">
                No te cobramos aún. Te pediremos iniciar sesión al confirmar.
              </p>
            )}
            {user && kyc !== "approved" && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-amber/10 px-3 py-2">
                <VerifyBadge status={kyc} />
                <button onClick={() => nav("/kyc")} className="text-xs font-medium text-amber underline-offset-2 hover:underline">
                  Verificar ahora
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={clsx("flex justify-between", strong ? "font-display text-base font-bold" : "text-ink/70")}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
