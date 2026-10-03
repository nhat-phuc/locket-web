"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
import DataTable from "@/components/admin/DataTable";
import SendForm from "./SendForm";

const TYPE_LABELS: Record<string, string> = {
  info: "Thông tin",
  success: "Thành công",
  warning: "Cảnh báo",
  error: "Lỗi",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotifications(d.notifications); });
  };

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotifications(d.notifications); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AdminPage title="Thông báo" description="Lịch sử thông báo gửi tới người dùng">
      <SendForm onSent={reload} />
      <DataTable
        loading={loading}
        data={notifications}
        emptyMessage="Chưa có thông báo nào"
        columns={[
          {
            key: "title",
            label: "Tiêu đề",
            render: (v) => <strong style={{ color: "var(--text-0)" }}>{v}</strong>,
          },
          {
            key: "content",
            label: "Nội dung",
            className: "cell-ellipsis",
          },
          {
            key: "type",
            label: "Loại",
            render: (v) => (
              <span className={`status-badge ${v}`}>
                {TYPE_LABELS[v] || v}
              </span>
            ),
          },
          {
            key: "isRead",
            label: "Trạng thái",
            render: (v) => (
              <span className={`status-badge ${v ? "completed" : "pending"}`}>
                {v ? "Đã đọc" : "Chưa đọc"}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Ngày gửi",
            render: (v) => {
              const d = new Date(v);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 700, color: "var(--text-0)", fontSize: 14 }}>
                    {d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                    {d.toLocaleDateString("vi-VN")}
                  </span>
                </div>
              );
            },
          },
        ]}
      />
    </AdminPage>
  );
}
