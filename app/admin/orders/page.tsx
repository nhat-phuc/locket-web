"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  orderCode: string;
  serviceName: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: string;
  locketUsername: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  expired: "Hết hạn",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = () => {
    setLoading(true);
    fetch(`/api/admin/orders?page=${page}&limit=20&status=${filter}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
          setTotalPages(data.totalPages);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [page, filter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) loadOrders();
  };

  return (
    <>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 24 }}>Đơn hàng</h1>

      <div style={{ marginBottom: 16 }}>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-1)", color: "var(--text-0)" }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="paid">Đã thanh toán</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
          <option value="expired">Hết hạn</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Dịch vụ</th>
                  <th>Username Locket</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-2)" }}>Không có đơn hàng</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent-bright)" }}>{o.orderCode}</td>
                      <td>{o.serviceName}</td>
                      <td>{o.locketUsername}</td>
                      <td style={{ fontWeight: 700, color: "#4ade80" }}>{o.finalAmount.toLocaleString("vi-VN")}đ</td>
                      <td><span className={`status-badge ${o.status}`}>{statusLabels[o.status] || o.status}</span></td>
                      <td style={{ color: "var(--text-2)", fontSize: 13 }}>{new Date(o.createdAt).toLocaleString("vi-VN")}</td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-0)", fontSize: 13 }}
                        >
                          {Object.entries(statusLabels).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="admin-btn">← Trước</button>
              <span style={{ padding: "10px 16px", color: "var(--text-2)" }}>Trang {page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-btn">Sau →</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
