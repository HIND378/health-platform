"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";
import { getCurrentUser, saveToken, clearToken } from "@/lib/auth";
import { authApi } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const res = await authApi.login(email);
    saveToken(res.access_token);
    const u = getCurrentUser();
    setUser(u);
    if (!u) return;
    if (u.role === "patient") router.push("/dashboard/patient");
    else if (u.role === "medecin") router.push("/dashboard/medecin");
    else router.push("/dashboard/admin");
  };

  const logout = () => {
    clearToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);