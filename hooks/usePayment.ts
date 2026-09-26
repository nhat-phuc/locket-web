"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PaymentStatus = "idle" | "pending" | "paid" | "expired" | "cancelled";

export interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  finalAmount: number;
  locketUsername: string;
  status: string;
  expiresAt: string | null;
}

export interface QRData {
  qrUrl: string;
  content: string;
  amount: number;
  bank: {
    bankId: string;
    bankName: string;
    accountNo: string;
    accountName: string;
  };
}

interface CreateOrderParams {
  serviceId: string;
  locketUsername: string;
  couponCode?: string;
  packageId?: string;
}

const POLL_INTERVAL = 3000;

export function usePayment() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [order, setOrder] = useState<Order | null>(null);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval khi unmount
  const clearTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (cdRef.current) clearInterval(cdRef.current);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Tạo đơn hàng + QR
  const createOrder = useCallback(async (params: CreateOrderParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
        setStatus("pending");

        // Lấy QR
        const qrRes = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.order.id }),
        });
        const qrJson = await qrRes.json();

        if (qrJson.success) {
          setQrData({
            qrUrl: qrJson.qrUrl,
            content: qrJson.content,
            amount: qrJson.amount,
            bank: qrJson.bank,
          });

          if (data.order.expiresAt) {
            const seconds = Math.max(
              0,
              Math.floor(
                (new Date(data.order.expiresAt).getTime() - Date.now()) / 1000
              )
            );
            setCountdown(seconds);
          }
        }
        return { success: true, order: data.order };
      }
      setError(data.message || "Không thể tạo đơn");
      return { success: false, message: data.message };
    } catch {
      setError("Lỗi kết nối");
      return { success: false, message: "Lỗi kết nối" };
    } finally {
      setLoading(false);
    }
  }, []);

  // Đếm ngược
  useEffect(() => {
    if (status !== "pending" || countdown <= 0) return;
    cdRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearTimers();
          setStatus("expired");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (cdRef.current) clearInterval(cdRef.current);
    };
  }, [status, countdown > 0, clearTimers]);

  // Poll kiểm tra thanh toán
  useEffect(() => {
    if (status !== "pending" || !order) return;
    const user = sessionStorage.getItem("locket_user");
    if (!user) return;
    const email = JSON.parse(user).email;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payments/check?orderId=${order.id}&email=${email}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.status === "paid") {
          clearTimers();
          setStatus("paid");
        } else if (data.status === "expired" || data.status === "cancelled") {
          clearTimers();
          setStatus("expired");
        }
      } catch {}
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, order, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setStatus("idle");
    setOrder(null);
    setQrData(null);
    setCountdown(0);
    setError(null);
  }, [clearTimers]);

  const countdownStr = `${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}`;

  return {
    status,
    order,
    qrData,
    loading,
    error,
    countdown,
    countdownStr,
    createOrder,
    reset,
  };
}
