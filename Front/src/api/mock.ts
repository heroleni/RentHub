// ⚠️ Este archivo conserva el nombre "mock.ts" por compatibilidad de imports,
// pero YA NO usa datos quemados: cada método llama al backend real de RentHub
// a través del cliente HTTP (./client). Mantiene las mismas firmas que la
// versión mock original para no romper las páginas que lo consumen.

import { http } from "./client";
import type {
  Property,
  Booking,
  OwnerProperty,
  KycResult,
  AdminStats,
  AdminProperty,
} from "../lib/types";

export interface SearchParams {
  city?: string;
  from?: string;
  to?: string;
}

// El backend ya serializa en camelCase y los DTOs coinciden con los tipos del
// front, así que el "mapeo" es prácticamente directo. Estos helpers existen por
// claridad y para tolerar nulos.

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== "");
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
}

export const api = {
  // ── Catálogo (público) ────────────────────────────────────────────────
  async searchProperties(params: SearchParams): Promise<Property[]> {
    const query = qs({ city: params.city, from: params.from, to: params.to });
    return http.get<Property[]>(`/api/properties/${query}`);
  },

  async getProperty(id: string): Promise<Property | undefined> {
    return http.get<Property>(`/api/properties/${id}`);
  },

  // ── KYC (requiere login). Envía multipart/form-data con las dos imágenes. ─
  async submitKyc(frontImage: string, backImage: string): Promise<KycResult> {
    const form = new FormData();
    form.append("front", await dataUrlToBlob(frontImage), "front.jpg");
    form.append("back", await dataUrlToBlob(backImage), "back.jpg");
    return http.postRaw<KycResult>("/api/kyc/", form, true);
  },

  // ── Reservas del usuario autenticado ──────────────────────────────────
  async myBookings(): Promise<Booking[]> {
    return http.get<Booking[]>("/api/bookings/me", true);
  },

  async createBooking(input: {
    propertyId: string;
    from: string;
    to: string;
    guests: number;
  }): Promise<Booking> {
    return http.post<Booking>("/api/bookings/", input, true);
  },

  // ── Dashboard del anfitrión ───────────────────────────────────────────
  async ownerProperties(): Promise<OwnerProperty[]> {
    return http.get<OwnerProperty[]>("/api/owner/properties", true);
  },

  async exportOwnerReport(propertyId?: string): Promise<Blob> {
    const query = qs({ propertyId });
    return http.getBlob(`/api/owner/reports/export${query}`, true);
  },
};

// ── Favoritos ───────────────────────────────────────────────────────────
export const favoritesApi = {
  async list(): Promise<Property[]> {
    return http.get<Property[]>("/api/favorites/", true);
  },
  async add(propertyId: string): Promise<void> {
    await http.post<void>(`/api/favorites/${propertyId}`, undefined, true);
  },
  async remove(propertyId: string): Promise<void> {
    await http.delete<void>(`/api/favorites/${propertyId}`, true);
  },
};

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  async getStats(): Promise<AdminStats> {
    return http.get<AdminStats>("/api/admin/stats", true);
  },
  async getAllProperties(): Promise<AdminProperty[]> {
    return http.get<AdminProperty[]>("/api/admin/properties", true);
  },
  async exportReport(): Promise<Blob> {
    return http.getBlob("/api/admin/reports/export", true);
  },
};

// Convierte un data URL (base64 del <input type=file> ya leído) a Blob para multipart.
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
