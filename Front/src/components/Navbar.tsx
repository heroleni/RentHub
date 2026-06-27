import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { useWishlist } from "../store/wishlist";
import { useAuth } from "../store/auth";
import { Button, VerifyBadge } from "./ui";

export function Navbar() {
  const count = useWishlist((s) => s.ids.size);
  const { user, kyc, openAuth, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          <span className="text-moss-deep">&lt;/</span>rent<span className="text-moss-deep">&gt;</span>
          <span className="ml-1 text-ink/40 font-body text-sm">hub</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <NavLink to="/wishlist" className="focusable relative rounded-full p-2.5 hover:bg-ink/5">
            <Heart size={19} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-coral text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </NavLink>

          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className="focusable hidden items-center gap-1.5 rounded-full px-3 py-2 hover:bg-ink/5 sm:flex"
            >
              <ShieldCheck size={17} /> Admin
            </NavLink>
          )}

          {user?.role === "owner" || !user ? (
            <NavLink
              to="/owner"
              className="focusable hidden items-center gap-1.5 rounded-full px-3 py-2 hover:bg-ink/5 sm:flex"
            >
              <LayoutDashboard size={17} /> Anfitrión
            </NavLink>
          ) : null}

          {user ? (
            <div className="flex items-center gap-3 pl-2">
              <NavLink to="/bookings" className="focusable rounded-full px-3 py-2 hover:bg-ink/5">
                Mis reservas
              </NavLink>
              <VerifyBadge status={kyc} className="hidden md:inline-flex" />
              <button
                onClick={() => { logout(); nav("/"); }}
                className="focusable rounded-full p-2.5 hover:bg-ink/5"
                aria-label="Cerrar sesión"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <Button size="sm" onClick={() => openAuth("book")} className="ml-2">
              Entrar
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
