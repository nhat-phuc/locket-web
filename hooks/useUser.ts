"use client";

import { useCallback, useEffect, useState } from "react";

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  name?: string;
  picture?: string;
  phone?: string;
  balance: number;
  role: string;
  createdAt?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/me", { cache: "no-store" });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        setBalance(data.user.balance || 0);
      } else {
        setError(data.message || "Không thể tải thông tin user");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Cập nhật thông tin user
  const updateProfile = useCallback(
    async (updates: { name?: string; phone?: string; picture?: string }) => {
      try {
        const res = await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return { success: true, message: "Cập nhật thành công" };
        }
        return { success: false, message: data.message || "Lỗi cập nhật" };
      } catch {
        return { success: false, message: "Lỗi kết nối" };
      }
    },
    []
  );

  // Refresh số dư
  const refreshBalance = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `/api/balance?email=${encodeURIComponent(user.email)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.success) setBalance(data.balance || 0);
    } catch {}
  }, [user?.email]);

  return {
    user,
    balance,
    loading,
    error,
    refetch: fetchUser,
    updateProfile,
    refreshBalance,
    setBalance,
  };
}
