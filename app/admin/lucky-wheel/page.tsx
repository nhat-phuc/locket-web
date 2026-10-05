"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";

interface Spin {
  id: string;
  userId: string;
  label: string;
  value: number;
  createdAt: string;
}
interface TopUser {
  userId: string;
  username: string;
  email: string;
  count: number;
}
interface Stats {
  totalSpins: number;
  todaySpins: number;
  totalPaid: number;
}

export default function LuckyWheelAdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/lucky-wheel")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.stats);
          setSpins(d.spins || []);
          setTopUsers(d.topUsers || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";

  if (loading) {
    return (
      <AdminPage title="🎡 Vòng quay" description="Quản lý vòng quay may mắn">
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="🎡 Vòng quay may mắn" description="Thống kê + lịch sử quay">
      {/* 3 card thống kê */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Tổng lượt quay" value={stats?.totalSpins || 0} color="#3b82f6" />
        <StatCard label="Hôm nay" value={stats?.todaySpins || 0} color="#fbbf24" />
        <StatCard label="Tổng tiền đã trả" value={fmt(stats?.totalPaid || 0)} color="#10b981" />
      </div>

      {/* Top user */}
      {topUsers.length > 0 && (
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: "var(--text-0)" }}>🏆 Top người quay nhiều</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {topUsers.map((u, i) => (
              <div key={u.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < topUsers.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? "#fbbf24" : i === 1 ? "#cbd5e1" : i === 2 ? "#fb923c" : "var(--bg-2)", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900 }}>{i + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)" }}>@{u.username}</div>
                    <div style={{ fontSize: 11, color: "var(--text-2)" }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fbbf24" }}>{u.count} lượt</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lịch sử quay */}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: "var(--text-0)" }}>📜 Lịch sử quay (100 gần nhất)</h2>
        {spins.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>Chưa có lượt quay nào</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {spins.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-0)" }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>
                    User: {s.userId.slice(0, 8)}... · {new Date(s.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.value > 0 ? "#10b981" : "var(--text-2)", whiteSpace: "nowrap" }}>
                  {s.value > 0 ? "+" + fmt(s.value) : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPage>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}
