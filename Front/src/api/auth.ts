import { http, setToken } from "./client";
import type { Role, KycStatus } from "../lib/types";

export interface AuthResult {
  token: string;
  email: string;
  fullName: string;
  role: Role;
  kycStatus: KycStatus;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResult> {
    const result = await http.post<AuthResult>("/api/auth/login", { email, password });
    setToken(result.token);
    return result;
  },

  async register(
    email: string,
    password: string,
    fullName: string,
    role: Role
  ): Promise<AuthResult> {
    const result = await http.post<AuthResult>("/api/auth/register", {
      email,
      password,
      fullName,
      role,
    });
    setToken(result.token);
    return result;
  },

  logout() {
    setToken(null);
  },
};
