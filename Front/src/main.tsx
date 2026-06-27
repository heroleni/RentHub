import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { useAuth } from "./store/auth";

// Restaura la sesión (token JWT + usuario) antes de montar la app.
useAuth.getState().hydrate();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
