"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPage from "@/components/admin/AdminPage";

interface Spin {
  id: string; userId: string; username: string; email: string;
  label: string; value: number; type: string; createdAt: string;
}
interface UserInfo {
  id: string; username: string; email: string; name: string | null; picture: string | null;
  role: string; balance: number; bonusBalance: number;
  spinsUsed: number; spinsLeft: number; maxSpins: number;
  totalSpins: number; totalWon: number;
}
interface Stats {
  totalSpins: number; todaySpins: number; totalPaid: number; totalUsers: number;
}

export default function LuckyWheelAdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "history">("users");
  const [search, setSearch] = useState("");
  const [resetInput, setResetInput] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetting, setResetting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/lucky-wheel")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.stats);
          setUsers(d.users || []);
          setSpins(d.spins || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleReset = async (userId: string, mode = "reset", value = 0) => {
    setResetting(true);
    setResetMsg("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-spins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, value }),
      });
      const d = await res.json();
      if (d.success) {
        setResetMsg("✅ " + d.message);
        setResetInput("");
        load();
      } else {
        setResetMsg("❌ " + (d.message || "Lỗi"));
      }
    } catch {
      setResetMsg("❌ Lỗi kết nối");
    } finally {
      setResetting(false);
    }
  };

  const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
  });

  const filteredSpins = spins.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.username?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.label?.toLowerCase().includes(q);
  });

  const userSpins = selectedUser ? spins.filter((s) => s.userId === selectedUser.id) : [];

  return (
    <AdminPage
      title="🎡 Vòng quay may mắn"
      description="Hệ thống quản lý vòng quay"
      actions={<button onClick={load} disabled={loading} className="admin-btn">{loading ? "Đang tải..." : "🔄 Làm mới"}</button>}
    >
      {/* 4 STAT CARDS - chuyên nghiệp */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <BigStatCard label="TỔNG LƯỢT QUAY" value={stats?.totalSpins || 0} icon="🎯" from="#3b82f6" to="#60a5fa" />
        <BigStatCard label="LƯỢT HÔM NAY" value={stats?.todaySpins || 0} icon="📅" from="#f59e0b" to="#fbbf24" />
        <BigStatCard label="TIỀN ĐÃ TRẢ" value={fmt(stats?.totalPaid || 0)} icon="💰" from="#10b981" to="#34d399" />
        <BigStatCard label="TỔNG NGƯỜI DÙNG" value={stats?.totalUsers || 0} icon="👥" from="#8b5cf6" to="#a78bfa" />
      </div>

      {/* Reset Toolbar */}
      <div style={{ background: "linear-gradient(135deg, rgba(167,139,250,.06), rgba(124,58,237,.03))", border: "1px solid rgba(167,139,250,.2)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #fbbf24)", display: "grid", placeItems: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text-0)" }}>Điều khiển nhanh</div>
            <div style={{ fontSize: 12, color: "var(--text-2)" }}>Nhập username hoặc ID rồi chọn hành động</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            value={resetInput}
            onChange={(e) => setResetInput(e.target.value)}
            placeholder="🔍 Username hoặc User ID..."
            className="admin-btn"
            style={{ flex: 1, minWidth: 220, textAlign: "left", background: "#fff", fontWeight: 600 }}
          />
          <button onClick={() => handleReset(resetInput, "reset")} disabled={resetting} className="admin-btn" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff", fontWeight: 800, borderColor: "transparent", minWidth: 110 }}>
            🔄 Reset 3
          </button>
          <button onClick={() => handleReset(resetInput, "add", 1)} disabled={resetting} className="admin-btn" style={{ background: "linear-gradient(135deg,#10b981,#34d399)", color: "#fff", fontWeight: 800, borderColor: "transparent" }}>
            ➕ Cộng 1
          </button>
          <button onClick={() => handleReset(resetInput, "add", 5)} disabled={resetting} className="admin-btn" style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)", color: "#fff", fontWeight: 800, borderColor: "transparent" }}>
            ➕ Cộng 5
          </button>
        </div>
        {resetMsg && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: resetMsg.startsWith("✅") ? "rgba(52,211,153,.12)" : "rgba(248,113,113,.12)", color: resetMsg.startsWith("✅") ? "#10b981" : "#f87171", border: `1px solid ${resetMsg.startsWith("✅") ? "rgba(52,211,153,.3)" : "rgba(248,113,113,.3)"}` }}>
            {resetMsg}
          </div>
        )}
      </div>

      {/* Tabs + Search */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--bg-1)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <button onClick={() => setTab("users")} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: tab === "users" ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "transparent", color: tab === "users" ? "#fff" : "var(--text-2)", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            👥 Users ({users.length})
          </button>
          <button onClick={() => setTab("history")} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: tab === "history" ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "transparent", color: tab === "history" ? "#fff" : "var(--text-2)", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            📜 Lịch sử ({spins.length})
          </button>
        </div>
        <input type="text" placeholder="🔍 Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-btn" style={{ flex: 1, minWidth: 200, textAlign: "left" }} />
      </div>

      {/* USER TABLE */}
      {tab === "users" && (
        <>
          {filteredUsers.length === 0 ? (
            <EmptyState icon="👥" text="Chưa có user nào" />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {filteredUsers.map((u) => (
                <div key={u.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: 16, transition: "all .15s" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    {/* Avatar + Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 220 }}>
                      <Avatar user={u} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-0)" }}>@{u.username}</span>
                          {u.role === "admin" && (
                            <span style={{ fontSize: 9.5, padding: "2px 8px", borderRadius: 999, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff", fontWeight: 900, letterSpacing: 0.5 }}>ADMIN</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>{u.email}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <MiniStat label="Số dư" value={fmt(u.balance)} color="#10b981" />
                      <MiniStat label="🎁 Vòng quay" value={fmt(u.bonusBalance)} color="#fbbf24" />
                      <MiniStat label="Lượt còn" value={`${u.spinsLeft}/${u.maxSpins}`} color={u.spinsLeft > 0 ? "#10b981" : "#f87171"} />
                      <MiniStat label="Tổng quay" value={u.totalSpins} color="#a78bfa" />
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setSelectedUser(u)} className="admin-btn" style={{ fontSize: 12, padding: "8px 14px", fontWeight: 700 }}>
                        📜 Chi tiết
                      </button>
                      <button onClick={() => handleReset(u.id, "reset")} className="admin-btn" style={{ fontSize: 12, padding: "8px 14px", background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff", fontWeight: 700, borderColor: "transparent" }}>
                        🔄 Reset
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <>
          {filteredSpins.length === 0 ? (
            <EmptyState icon="📜" text="Chưa có lượt quay nào" />
          ) : (
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              {filteredSpins.map((s, idx) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: idx < filteredSpins.length - 1 ? "1px solid var(--border)" : "none", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.value > 0 ? "linear-gradient(135deg,#10b981,#34d399)" : "var(--bg-2)", display: "grid", placeItems: "center", color: s.value > 0 ? "#fff" : "var(--text-2)", fontSize: 16, fontWeight: 900, flexShrink: 0 }}>
                      {s.value > 0 ? "✓" : "—"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-0)" }}>
                        <Link href={`/admin/lucky-wheel/${s.userId}`} style={{ color: "var(--accent-bright)", textDecoration: "none" }}>@{s.username}</Link>
                        <span style={{ margin: "0 8px", color: "var(--text-2)" }}>—</span>
                        <span>{s.label}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>{new Date(s.createdAt).toLocaleString("vi-VN")}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: s.value > 0 ? "#10b981" : "var(--text-2)", whiteSpace: "nowrap" }}>
                    {s.value > 0 ? "+" + fmt(s.value) : "Chúc may mắn"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal chi tiết user */}
      {selectedUser && (
        <div onClick={() => setSelectedUser(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, maxWidth: 640, width: "100%", maxHeight: "85vh", overflow: "auto", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <Avatar user={selectedUser} size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text-0)" }}>@{selectedUser.username}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>{selectedUser.email}</div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-2)", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-2)" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
              <InfoBox label="Số dư" value={fmt(selectedUser.balance)} color="#10b981" />
              <InfoBox label="Ví vòng quay" value={fmt(selectedUser.bonusBalance)} color="#fbbf24" />
              <InfoBox label="Lượt còn" value={`${selectedUser.spinsLeft}/${selectedUser.maxSpins}`} color="#3b82f6" />
              <InfoBox label="Tổng quay" value={selectedUser.totalSpins} color="#a78bfa" />
              <InfoBox label="Tổng thắng" value={fmt(selectedUser.totalWon)} color="#10b981" />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => handleReset(selectedUser.id, "reset")} className="admin-btn" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff", fontWeight: 800, borderColor: "transparent" }}>
                🔄 Reset 3 lượt
              </button>
              <button onClick={() => handleReset(selectedUser.id, "add", 1)} className="admin-btn" style={{ background: "linear-gradient(135deg,#10b981,#34d399)", color: "#fff", fontWeight: 800, borderColor: "transparent" }}>
                ➕ Cộng 1
              </button>
              <button onClick={() => handleReset(selectedUser.id, "add", 5)} className="admin-btn" style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)", color: "#fff", fontWeight: 800, borderColor: "transparent" }}>
                ➕ Cộng 5
              </button>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-0)", marginBottom: 10 }}>📜 Lịch sử quay ({userSpins.length})</div>
            {userSpins.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-2)", fontSize: 13, background: "var(--bg-2)", borderRadius: 10 }}>User chưa quay lần nào</div>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {userSpins.map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-2)", borderRadius: 10, gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-0)" }}>{s.label}</div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 11.5, color: "var(--text-2)" }}>{new Date(s.createdAt).toLocaleString("vi-VN")}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: s.value > 0 ? "#10b981" : "var(--text-2)" }}>{s.value > 0 ? "+" + fmt(s.value) : "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function Avatar({ user, size = 44 }: { user: any; size?: number }) {
  const [err, setErr] = useState(false);
  if (!user.picture || err) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: size * 0.4, flexShrink: 0 }}>
        {(user.username || "U")[0].toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.picture} alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  );
}

function BigStatCard({ label, value, icon, from, to }: { label: string; value: string | number; icon: string; from: string; to: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${from}15, ${to}08)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, position: "relative" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${from}, ${to})`, display: "grid", placeItems: "center", fontSize: 20 }}>{icon}</div>
        <div style={{ fontSize: 10.5, color: "var(--text-2)", fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, background: `linear-gradient(135deg, ${from}, ${to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", position: "relative" }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "var(--text-2)", fontWeight: 800, textTransform: "uppercase", marginBottom: 3, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

function InfoBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ padding: 12, background: "var(--bg-2)", borderRadius: 10 }}>
      <div style={{ fontSize: 10, color: "var(--text-2)", fontWeight: 800, textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ padding: 80, textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 64, marginBottom: 12, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 600 }}>{text}</div>
    </div>
  );
}
