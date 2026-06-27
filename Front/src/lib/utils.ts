// Standard stay policy from the brief: check-in 2:00 PM, check-out 12:00 PM
export const CHECK_IN_HOUR = "14:00";
export const CHECK_OUT_HOUR = "12:00";

export const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const nightsBetween = (from: string, to: string) => {
  const a = new Date(from + "T00:00:00").getTime();
  const b = new Date(to + "T00:00:00").getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
};

// Double-booking prevention helper (UI-side guard; the real check lives in your API)
export const rangesOverlap = (
  aFrom: string,
  aTo: string,
  bFrom: string,
  bTo: string
) => {
  const af = new Date(aFrom).getTime();
  const at = new Date(aTo).getTime();
  const bf = new Date(bFrom).getTime();
  const bt = new Date(bTo).getTime();
  return af < bt && bf < at;
};

export const isAvailable = (
  blocked: { from: string; to: string }[],
  from: string,
  to: string
) => !blocked.some((r) => rangesOverlap(from, to, r.from, r.to));

export const todayISO = () => new Date().toISOString().slice(0, 10);
