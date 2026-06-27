import { create } from "zustand";
import type { KycStatus, Role } from "../lib/types";
import { authApi } from "../api/auth";
import { getToken, setToken } from "../api/client";

interface User {
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  kyc: KycStatus;
  pendingIntent: null | "book" | "save" | "pay";
  isAuthModalOpen: boolean;
  error: string | null;
  loading: boolean;

  requireAuth: (intent: "book" | "save" | "pay") => boolean;
  openAuth: (intent: "book" | "save" | "pay") => void;
  closeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: Role) => Promise<void>;
  logout: () => void;
  setKyc: (s: KycStatus) => void;
  hydrate: () => void;
}

const SESSION_KEY = "renthub_session";

function loadSession(): { user: User; kyc: KycStatus } | null {
  // Solo restauramos sesión si además existe el token JWT.
  if (!getToken()) return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(user: User, kyc: KycStatus) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, kyc }));
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  kyc: "unstarted",
  pendingIntent: null,
  isAuthModalOpen: false,
  error: null,
  loading: false,

  requireAuth: (intent) => {
    if (get().user) return true;
    set({ isAuthModalOpen: true, pendingIntent: intent });
    return false;
  },
  openAuth: (intent) => set({ isAuthModalOpen: true, pendingIntent: intent }),
  closeAuth: () => set({ isAuthModalOpen: false, pendingIntent: null, error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const r = await authApi.login(email, password);
      const user: User = { email: r.email, name: r.fullName, role: r.role };
      saveSession(user, r.kycStatus);
      set({ user, kyc: r.kycStatus, isAuthModalOpen: false, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Error al iniciar sesión" });
      throw e;
    }
  },

  register: async (email, password, fullName, role) => {
    set({ loading: true, error: null });
    try {
      const r = await authApi.register(email, password, fullName, role);
      const user: User = { email: r.email, name: r.fullName, role: r.role };
      saveSession(user, r.kycStatus);
      set({ user, kyc: r.kycStatus, isAuthModalOpen: false, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Error al crear la cuenta" });
      throw e;
    }
  },

  logout: () => {
    authApi.logout();
    localStorage.removeItem(SESSION_KEY);
    set({ user: null, kyc: "unstarted", pendingIntent: null });
  },

  setKyc: (kyc) => {
    const u = get().user;
    if (u) saveSession(u, kyc);
    set({ kyc });
  },

  hydrate: () => {
    const session = loadSession();
    if (session) set({ user: session.user, kyc: session.kyc });
    else setToken(null);
  },
}));
