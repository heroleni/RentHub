import { clsx } from "clsx";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Loader2 } from "lucide-react";
import type { KycStatus } from "../lib/types";
import type { ReactNode, ButtonHTMLAttributes } from "react";

/* ---- Button ---- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost" | "coral";
  size?: "sm" | "md" | "lg";
};
export function Button({ variant = "solid", size = "md", className, ...rest }: BtnProps) {
  return (
    <button
      className={clsx(
        "focusable inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none",
        {
          solid: "bg-moss text-ink hover:bg-moss-glow",
          outline: "border border-ink/15 text-ink hover:border-ink/40 bg-transparent",
          ghost: "text-ink hover:bg-ink/5",
          coral: "bg-coral text-white hover:brightness-105",
        }[variant],
        { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" }[size],
        className
      )}
      {...rest}
    />
  );
}

/* ---- The signature element: a verification badge used app-wide ---- */
const KYC_META: Record<KycStatus, { label: string; icon: ReactNode; cls: string }> = {
  unstarted: { label: "Sin verificar", icon: <ShieldQuestion size={14} />, cls: "bg-paper-dim text-ink/60 border-ink/10" },
  processing: { label: "Verificando", icon: <Loader2 size={14} className="animate-spin" />, cls: "bg-amber/15 text-amber border-amber/30" },
  approved: { label: "Identidad verificada", icon: <ShieldCheck size={14} />, cls: "bg-moss/15 text-moss-deep border-moss/30" },
  rejected: { label: "Verificación fallida", icon: <ShieldAlert size={14} />, cls: "bg-coral/15 text-coral border-coral/30" },
};
export function VerifyBadge({ status, className }: { status: KycStatus; className?: string }) {
  const m = KYC_META[status];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", m.cls, className)}>
      {m.icon}
      {m.label}
    </span>
  );
}

/* ---- Card shell ---- */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-xl2 bg-white shadow-card", className)}>{children}</div>;
}

/* ---- Section eyebrow ---- */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow text-moss-deep mb-2">{children}</p>;
}
