"use client";

import AdminPage from "@/components/admin/AdminPage";

export default function AdminBannersPage() {
  return (
    <AdminPage title="Banner" description="Quản lý banner quảng cáo">
      <div className="admin-table-wrap" style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Chưa có banner nào</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>Tính năng upload banner đang phát triển</p>
      </div>
    </AdminPage>
  );
}
