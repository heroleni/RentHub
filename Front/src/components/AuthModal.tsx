import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../store/auth";
import { Button } from "./ui";

import type { Role } from "../lib/types";

const INTENT_COPY = {
  book: "Inicia sesión para confirmar tu reserva",
  save: "Inicia sesión para guardar este lugar permanentemente",
  pay: "Inicia sesión para continuar al pago",
} as const;

export function AuthModal() {
  const { isAuthModalOpen, pendingIntent, closeAuth, login, register, loading, error } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("guest");

  if (!isAuthModalOpen) return null;
  const title = pendingIntent ? INTENT_COPY[pendingIntent] : "Te damos la bienvenida";

  const canSubmit =
    email.includes("@") &&
    password.length >= 6 &&
    (mode === "login" || fullName.trim().length > 1);

  async function submit() {
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, fullName, role);
    } catch {
      /* el error se muestra desde el store */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={closeAuth}
    >
      <div
        className="w-full max-w-md rounded-xl2 bg-white p-7 shadow-lift"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow text-moss-deep">Acceso</p>
            <h2 className="mt-1 font-display text-2xl font-bold leading-tight">{title}</h2>
          </div>
          <button onClick={closeAuth} className="focusable rounded-full p-2 hover:bg-ink/5" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-sm text-ink/55">
          Explorar es libre. Solo pedimos tus datos cuando vas a reservar, pagar o guardar un lugar para siempre.
        </p>
        <p className="mt-1 rounded-lg bg-amber/10 px-3 py-1.5 text-xs text-amber">
          <strong>Demo:</strong> anfitrión <code>anfitrion@renthub.co</code> / <code>Owner123*</code>
        </p>

        <div className="mt-6 space-y-3">
          {mode === "register" && (
            <label className="block">
              <span className="text-xs font-medium text-ink/60">Nombre completo</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Camila Restrepo"
                className="focusable mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
              />
            </label>
          )}

          <label className="block">
            <span className="text-xs font-medium text-ink/60">Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="focusable mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink/60">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="focusable mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
            />
            {mode === "register" && password.length > 0 && password.length < 6 && (
              <span className="mt-1 block text-xs text-amber">Mínimo 6 caracteres.</span>
            )}
          </label>

          {mode === "register" && (
            <label className="block">
              <span className="text-xs font-medium text-ink/60">Tipo de cuenta</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="focusable mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
              >
                <option value="guest">Huésped</option>
                <option value="owner">Anfitrión</option>
              </select>
            </label>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        <Button size="lg" className="mt-6 w-full" disabled={!canSubmit || loading} onClick={submit}>
          {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </Button>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="focusable mt-4 w-full text-center text-sm text-ink/55 hover:text-ink"
        >
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}
