import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { api, favoritesApi } from "../api/mock";
import { PropertyCard } from "../features/catalog/PropertyCard";
import { useWishlist } from "../store/wishlist";
import { useAuth } from "../store/auth";
import { Eyebrow, Button } from "../components/ui";

export function WishlistPage() {
  const user = useAuth((s) => s.user);
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  // Ref para correr la sincronización solo una vez por carga de datos
  const synced = useRef(false);

  const { data } = useQuery({
    queryKey: ["favorites", user ? "remote" : "local"],
    queryFn: () => (user ? favoritesApi.list() : api.searchProperties({})),
  });

  // Cuando el backend devuelve los favoritos, poblamos el store local
  // para que PropertyCard pinte el corazón rojo correctamente.
  // Usamos un ref para no entrar en loop (ids cambia en cada toggle).
  useEffect(() => {
    if (!user || !data || synced.current) return;
    synced.current = true;
    const store = useWishlist.getState();
    data.forEach((p) => {
      if (!store.ids.has(p.id)) toggle(p.id);
    });
  }, [data, user, toggle]);

  // Reset ref si el usuario cambia (logout/login)
  useEffect(() => { synced.current = false; }, [user]);

  const saved = user ? (data ?? []) : (data ?? []).filter((p) => ids.has(p.id));

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <Eyebrow>Tu lista</Eyebrow>
      <h1 className="font-display text-3xl font-bold">Favoritos</h1>
      <p className="mt-1 text-sm text-ink/55">
        Los lugares que guardas se quedan aquí, listos para comparar o reservar cuando vuelvas.
      </p>

      {saved.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      ) : (
        <div className="mt-10 rounded-xl2 border border-dashed border-ink/15 py-20 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper-dim">
            <Heart className="text-ink/40" />
          </div>
          <p className="mt-4 font-display text-lg">Aún no guardas ningún lugar.</p>
          <p className="mt-1 text-sm text-ink/55">Toca el corazón en cualquier inmueble para empezar tu lista.</p>
          <Link to="/"><Button className="mt-5">Explorar el catálogo</Button></Link>
        </div>
      )}
    </div>
  );
}
