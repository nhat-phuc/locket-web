"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
import DataTable from "@/components/admin/DataTable";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/transactions")
      .then((r) => r.json())
      .then((d) => { if (d.success) setTransactions(d.transactions); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AdminPage title="Giao dịch" description="Lịch sử giao dịch của toàn hệ thống">
      <DataTable
        loading={loading}
        data={transactions}
        emptyMessage="Chưa có giao dịch nào"
        columns={[
          { key: "id", label: "ID", render: (v) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{v.slice(0, 12)}...</span> },
          { key: "type", label: "Loại", render: (v) => <span className="status-badge paid">{v}</span> },
          { key: "amount", label: "Số tiền", render: (v) => <span style={{ fontWeight: 700, color: "#4ade80" }}>{v.toLocaleString("vi-VN")}đ</span> },
          { key: "status", label: "Trạng thái", render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
          { key: "description", label: "Mô tả" },
          { key: "createdAt", label: "Ngày tạo", render: (v) => new Date(v).toLocaleString("vi-VN") },
        ]}
      />
    </AdminPage>
  );
}
