"use client";

import AdminPage from "@/components/admin/AdminPage";

export default function AdminLuckyWheelPage() {
  return (
    <AdminPage title="Vòng quay may mắn" description="Quản lý phần thưởng vòng quay">
      <div className="admin-table-wrap" style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎡</div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Quản lý vòng quay</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>Tính năng đang phát triển</p>
      </div>
    </AdminPage>
  );
}
