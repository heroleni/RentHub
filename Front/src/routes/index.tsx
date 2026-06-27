import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { CatalogPage } from "../pages/CatalogPage";
import { PropertyPage } from "../pages/PropertyPage";
import { WishlistPage } from "../pages/WishlistPage";
import { KycPage } from "../pages/KycPage";
import { BookingsPage } from "../pages/BookingsPage";
import { OwnerDashboardPage } from "../pages/OwnerDashboardPage";
import { AdminPage } from "../pages/AdminPage";
import { useAuth } from "../store/auth";

function AdminGuard() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <AdminPage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: "property/:id", element: <PropertyPage /> },
      { path: "wishlist", element: <WishlistPage /> },
      { path: "kyc", element: <KycPage /> },
      { path: "bookings", element: <BookingsPage /> },
      { path: "owner", element: <OwnerDashboardPage /> },
      { path: "admin", element: <AdminGuard /> },
    ],
  },
]);
