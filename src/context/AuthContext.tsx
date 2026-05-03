"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import axiosInstance from "@/lib/axios";

interface User {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: "ADMIN" | "SUPER_ADMIN";
  phone: string | null;
  address: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // On mount, check if there's a session (assuming we have a /me endpoint or similar)
  // For now, we'll implement a simple session check if needed, 
  // but usually we check in middleware and just hydrate here.
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data } = await axiosInstance.get("/admin/me");
        if (isMounted) {
          setUser(data.user);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          // If we fail the session check on a protected route, 
          // we don't redirect here; ProtectedRoute will handle it.
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setLoading(false);
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/admin/logout");
      setUser(null);
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
