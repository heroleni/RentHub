import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { AuthModal } from "./AuthModal";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-ink/50 sm:flex-row">
          <p>
            <span className="font-display font-bold text-ink">&lt;/rent&gt; hub</span> — Estancias verificadas.
          </p>
          <p>Check-in 14:00 · Check-out 12:00 · KYC con IA</p>
        </div>
      </footer>
      <AuthModal />
    </div>
  );
}
