"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  picture: string | null;
  role: string;
  balance: number;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = () => {
    setLoading(true);
    fetch(`/api/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
          setTotalPages(data.totalPages);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>Người dùng</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Tìm email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), loadUsers())}
            style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-1)", color: "var(--text-0)", minWidth: 240 }}
          />
          <button onClick={() => { setPage(1); loadUsers(); }} className="admin-btn">Tìm</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Tên</th>
                  <th>Số dư</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.picture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(u.username) + "&background=7c3aed&color=fff&size=100"} alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                    </td>
                    <td style={{ fontWeight: 700 }}>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.name || "—"}</td>
                    <td style={{ fontWeight: 700, color: "#4ade80" }}>{u.balance.toLocaleString("vi-VN")}đ</td>
                    <td><span className={`status-badge ${u.role === "admin" ? "paid" : "pending"}`}>{u.role}</span></td>
                    <td><span className={`status-badge ${u.isBanned ? "cancelled" : u.isActive ? "paid" : "expired"}`}>{u.isBanned ? "Banned" : u.isActive ? "Active" : "Inactive"}</span></td>
                    <td style={{ color: "var(--text-2)", fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
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
