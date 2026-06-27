import { Link } from "react-router-dom";
import { Heart, Star, MapPin } from "lucide-react";
import { clsx } from "clsx";
import type { Property } from "../../lib/types";
import { money } from "../../lib/utils";
import { useWishlist } from "../../store/wishlist";

export function PropertyCard({ property }: { property: Property }) {
  const { has, toggle } = useWishlist();
  const saved = has(property.id);

  return (
    <Link
      to={`/property/${property.id}`}
      className="focusable group block overflow-hidden rounded-xl2 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <button
          onClick={(e) => { e.preventDefault(); toggle(property.id); }}
          className="focusable absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110"
          aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart size={17} className={clsx(saved ? "fill-coral text-coral" : "text-ink/70")} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold leading-snug">{property.title}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm">
            <Star size={13} className="fill-amber text-amber" /> {property.rating}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink/55">
          <MapPin size={13} /> {property.city}, {property.country}
        </p>
        <p className="mt-3 text-sm">
          <span className="font-display text-lg font-bold">{money(property.pricePerNight)}</span>
          <span className="text-ink/55"> / noche</span>
        </p>
      </div>
    </Link>
  );
}
