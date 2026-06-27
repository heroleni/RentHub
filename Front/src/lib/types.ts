export type Role = "guest" | "owner" | "admin";

export interface AdminStats {
  totalProperties: number;
  totalUsers: number;
  totalRevenue: number;
  activeBookings: number;
  kycApproved: number;
  kycPending: number;
}

export interface AdminProperty extends OwnerProperty {
  hostName: string;
  isActive: boolean;
}

export interface Property {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  beds: number;
  baths: number;
  guests: number;
  images: string[];
  hostName: string;
  blockedRanges: { from: string; to: string }[]; // ISO dates already booked
  tags: string[];
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  city: string;
  image: string;
  checkIn: string;  // ISO date
  checkOut: string; // ISO date
  guests: number;
  total: number;
  status: BookingStatus;
}

export type KycStatus = "unstarted" | "processing" | "approved" | "rejected";

export interface KycResult {
  status: KycStatus;
  names?: string;
  lastNames?: string;
  documentNumber?: string;
  birthDate?: string;
  reason?: string;
}

export interface OwnerProperty extends Property {
  occupancyRate: number; // 0..1
  monthlyRevenue: number;
  nightsBooked: number;
}
