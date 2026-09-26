"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
import DataTable from "@/components/admin/DataTable";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => r.json())
      .then((d) => { if (d.success) setLogs(d.logs); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AdminPage title="Logs" description="Nhật ký hoạt động hệ thống">
      <DataTable
        loading={loading}
        data={logs}
        emptyMessage="Chưa có log nào"
        columns={[
          { key: "action", label: "Hành động" },
          { key: "detail", label: "Chi tiết" },
          { key: "userId", label: "User ID", render: (v) => v ? v.slice(0, 12) + "..." : "—" },
          { key: "ip", label: "IP" },
          { key: "createdAt", label: "Thời gian", render: (v) => new Date(v).toLocaleString("vi-VN") },
        ]}
      />
    </AdminPage>
  );
}
