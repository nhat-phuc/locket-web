"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
import DataTable from "@/components/admin/DataTable";
import SendForm from "./SendForm";

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
          { key: "title", label: "Tiêu đề" },
          { key: "content", label: "Nội dung" },
          { key: "type", label: "Loại", render: (v) => <span className={`status-badge ${v === "success" ? "paid" : "pending"}`}>{v}</span> },
          { key: "isRead", label: "Đã đọc", render: (v) => v ? "✓" : "—" },
          { key: "createdAt", label: "Ngày", render: (v) => new Date(v).toLocaleString("vi-VN") },
        ]}
      />
    </AdminPage>
  );
}
