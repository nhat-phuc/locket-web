"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id?: string;
  email: string;
  username: string;
  name?: string;
  picture?: string;
  balance?: number;
  role?: string;
}

export function useAuth(redirectIfNotLoggedIn = false) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user từ sessionStorage khi mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("locket_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else if (redirectIfNotLoggedIn) {
        router.push("/dang-nhap");
      }
    } catch {
      if (redirectIfNotLoggedIn) router.push("/dang-nhap");
    } finally {
      setLoading(false);
    }
  }, [router, redirectIfNotLoggedIn]);

  // Đăng nhập: lưu user vào sessionStorage
  const login = useCallback((userData: AuthUser) => {
    sessionStorage.setItem("locket_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Đăng xuất
  const logout = useCallback(() => {
    sessionStorage.removeItem("locket_user");
    sessionStorage.removeItem("locket_order");
    setUser(null);
    window.location.href = "/";
  }, []);

  // Cập nhật thông tin user
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem("locket_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };
}
