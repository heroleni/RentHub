import { create } from "zustand";

interface WishlistState {
  ids: Set<string>;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: () => number;
}

// Anonymous users can favorite during the session; persisting permanently
// requires auth (handled in the UI via useAuth.requireAuth("save")).
export const useWishlist = create<WishlistState>((set, get) => ({
  ids: new Set<string>(),
  has: (id) => get().ids.has(id),
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.ids);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ids: next };
    }),
  count: () => get().ids.size,
}));
