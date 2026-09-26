"use client";

import AdminPage from "@/components/admin/AdminPage";

export default function AdminSettingsPage() {
  return (
    <AdminPage title="Cài đặt" description="Cấu hình hệ thống">
      <div className="admin-table-wrap" style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚙️</div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Cài đặt hệ thống</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>Tính năng đang phát triển</p>
      </div>
    </AdminPage>
  );
}
