"use client";

import { useEffect, useRef } from "react";
import { requestNotificationPermission, showNotification } from "@/lib/notifications";

export default function BrowserNotification() {
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    requestNotificationPermission();

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications/latest");
        const data = await res.json();
        if (!data.success || !data.notifications?.length) return;

        const latest = data.notifications[0];
        if (latest.id !== lastIdRef.current) {
          lastIdRef.current = latest.id;
          showNotification(latest.title, latest.content);
        }
      } catch {}
    }, 30000); // 30s

    return () => clearInterval(interval);
  }, []);

  return null;
}
