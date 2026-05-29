/**
 * Auth через Telegram Mini App initData
 * При первом запуске валидирует данные через API и сохраняет пользователя
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { trpc } from "@/providers/trpc";

interface AuthUser {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  role: string;
  selectedRole?: string;
  photoUrl?: string;
  onboardingComplete: boolean;
  isBlocked?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isSpecialist: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setRole: (role: string) => void;
  completeOnboarding: () => void;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: { show: () => void; hide: () => void; setText: (t: string) => void };
      };
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authMutation = trpc.auth.telegramAuth.useMutation();
  const setRoleMutation = trpc.auth.setRole.useMutation();
  const completeOnboardingMutation = trpc.auth.completeOnboarding.useMutation();

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const tgWebApp = window.Telegram?.WebApp;

      // Dev mode: проверяем localStorage
      const saved = localStorage.getItem("omnifind_user");
      if (saved && !tgWebApp?.initData) {
        setUser(JSON.parse(saved));
        setIsLoading(false);
        return;
      }

      if (!tgWebApp?.initData) {
        // Не в Telegram — в dev режиме можно авторизоваться вручную
        console.warn("Not in Telegram WebApp context");
        setIsLoading(false);
        return;
      }

      tgWebApp.ready();
      tgWebApp.expand();

      const result = await authMutation.mutateAsync({
        initData: tgWebApp.initData,
      });

      const authUser: AuthUser = {
        id: result.id,
        telegramId: result.telegramId,
        firstName: result.firstName || "",
        lastName: result.lastName || undefined,
        username: result.username || undefined,
        photoUrl: result.photoUrl || undefined,
        role: result.role || "specialist",
        selectedRole: result.selectedRole || undefined,
        onboardingComplete: result.onboardingComplete,
        isBlocked: result.isBlocked,
      };

      setUser(authUser);
      localStorage.setItem("omnifind_user", JSON.stringify(authUser));
    } catch (e) {
      console.error("Auth error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, []);

  const login = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem("omnifind_user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("omnifind_user");
  }, []);

  const setRole = useCallback(async (role: string) => {
    if (!user) return;
    await setRoleMutation.mutateAsync({
      telegramId: user.telegramId,
      role: role as "specialist" | "customer" | "both",
    });
    const updated = { ...user, selectedRole: role };
    setUser(updated);
    localStorage.setItem("omnifind_user", JSON.stringify(updated));
  }, [user, setRoleMutation]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    await completeOnboardingMutation.mutateAsync({ telegramId: user.telegramId });
    const updated = { ...user, onboardingComplete: true };
    setUser(updated);
    localStorage.setItem("omnifind_user", JSON.stringify(updated));
  }, [user, completeOnboardingMutation]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin: user?.role === "admin",
      isSpecialist: user?.selectedRole === "specialist" || user?.role === "specialist",
      isCustomer: user?.selectedRole === "customer" || user?.role === "customer",
      login,
      logout,
      setRole,
      completeOnboarding,
      refetch: initAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
