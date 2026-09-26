"use client";

import AdminPage from "@/components/admin/AdminPage";

export default function AdminPackagesPage() {
  return (
    <AdminPage title="Gói dịch vụ" description="Quản lý các gói con của dịch vụ">
      <div className="admin-table-wrap" style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Tính năng đang phát triển</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>Sẽ sớm được cập nhật</p>
      </div>
    </AdminPage>
  );
}
