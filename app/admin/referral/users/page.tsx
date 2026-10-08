"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPage from "@/components/admin/AdminPage";

interface UserRow {
  id: string;
  username: string | null;
  email: string;
  name: string | null;
  picture: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  isOnline: boolean;
  balance: number;
  bonusBalance: number;
  spinsUsed: number;
  spinsLeft: number;
  maxSpins: number;
  referralCode: string | null;
  codeChangedAt: string | null;
  totalReferrals: number;
  commissionEarned: number;
  referredBy: { username: string | null; email: string; referralCode: string | null } | null;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  usersWithCode: number;
  usersWithReferrals: number;
  usersWithReferrer: number;
  totalCommissionEarned: number;
  totalReferralsCount: number;
  admins: number;
  banned: number;
  totalBalance: number;
}

interface UserDetail {
  user: {
    id: string;
    username: string | null;
    email: string;
    phone: string | null;
    referralCode: string | null;
    codeChangedAt: string | null;
    totalReferrals: number;
    commission: number;
    balance: number;
    bonusBalance: number;
    role: string;
    joinedAt: string;
  };
  invited: Array<{
    id: string;
    username: string | null;
    email: string;
    code: string;
    commission: number;
    commissionPaid: boolean;
    paidAt: string | null;
    joinedAt: string;
  }>;
  referredBy: {
    username: string | null;
    email: string;
    referralCode: string | null;
    commission: number;
    commissionPaid: boolean;
  } | null;
}

export default function AdminReferralUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterHasReferrals, setFilterHasReferrals] = useState(false);
  const [filterHasReferrer, setFilterHasReferrer] = useState(false);
  const [filterNoCode, setFilterNoCode] = useState(false);
  const [detail, setDetail] = useState<UserDetail | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filterHasReferrals) params.set("hasReferrals", "true");
    if (filterHasReferrer) params.set("hasReferrer", "true");
    if (filterNoCode) params.set("noCode", "true");

    fetch(`/api/admin/referral/users?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) { setUsers(d.users || []); setStats(d.stats); } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, filterHasReferrals, filterHasReferrer, filterNoCode]);

  const openDetail = async (id: string) => {
    const r = await fetch(`/api/admin/referral/users/${id}`);
    const d = await r.json();
    if (d.success) setDetail(d);
  };

  const resetCode = async (id: string) => {
    if (!confirm("Reset mã cho user này?")) return;
    const r = await fetch(`/api/admin/referral/users/${id}/reset-code`, { method: "POST" });
    const d = await r.json();
    alert(d.message || (d.success ? "Đã reset" : "Lỗi"));
    load();
  };

  const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";

  return (
    <AdminPage
      title="Người dùng & Mã giới thiệu"
      description="Xem mã GT, số dư, hoa hồng, người mời của từng user"
      actions={<Link href="/admin/referral" className="admin-btn">← Về tổng quan</Link>}
    >
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard label="Tổng user" value={stats.totalUsers} color="#60a5fa" />
          <StatCard label="Có mã GT" value={stats.usersWithCode} color="#a78bfa" />
          <StatCard label="Có mời người" value={stats.usersWithReferrals} color="#10b981" />
          <StatCard label="Được mời" value={stats.usersWithReferrer} color="#fbbf24" />
          <StatCard label="Tổng hoa hồng" value={fmt(stats.totalCommissionEarned)} color="#34d399" />
          <StatCard label="Tổng lượt mời" value={stats.totalReferralsCount} color="#f472b6" />
          <StatCard label="Admin" value={stats.admins} color="#a78bfa" />
          <StatCard label="Bị ban" value={stats.banned} color="#f87171" />
        </div>
      )}

      <div className="admin-filter" style={{ marginBottom: 16 }}>
        <input type="text" placeholder="🔍 Tìm username / email / mã GT..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <FilterBtn active={filterHasReferrals} onClick={() => setFilterHasReferrals((v) => !v)}>👥 Có mời người</FilterBtn>
          <FilterBtn active={filterHasReferrer} onClick={() => setFilterHasReferrer((v) => !v)}>🔗 Được mời bởi</FilterBtn>
          <FilterBtn active={filterNoCode} onClick={() => setFilterNoCode((v) => !v)}>⚠️ Chưa có mã</FilterBtn>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)" }}>Đang tải...</div>
      ) : users.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 14, border: "1px solid var(--border)" }}>
          Không có user nào
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-1)", borderRadius: 12, overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "var(--bg-2)" }}>
                <Th>User</Th>
                <Th>Mã GT</Th>
                <Th>Đã mời</Th>
                <Th>Hoa hồng</Th>
                <Th>Số dư</Th>
                <Th>Người mời</Th>
                <Th>Trạng thái</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {u.picture ? (
                        <img src={u.picture} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                          {(u.username || u.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-0)", fontSize: 13 }}>@{u.username || "(no username)"}</div>
                        <div style={{ fontSize: 11, color: "var(--text-2)" }}>{u.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {u.referralCode ? (
                      <code style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(167,139,250,.15)", color: "var(--accent-bright)", fontSize: 12, fontWeight: 700 }}>
                        {u.referralCode}
                      </code>
                    ) : (
                      <span style={{ color: "#f87171", fontSize: 12 }}>⚠️ Chưa có</span>
                    )}
                  </Td>
                  <Td><span style={{ fontWeight: 700, color: "#60a5fa" }}>{u.totalReferrals}</span></Td>
                  <Td><span style={{ fontWeight: 700, color: "#10b981" }}>{fmt(u.commissionEarned)}</span></Td>
                  <Td><span style={{ fontWeight: 700, color: "var(--text-0)" }}>{fmt(u.balance)}</span></Td>
                  <Td>
                    {u.referredBy ? (
                      <span style={{ fontSize: 12 }}>@{u.referredBy.username || u.referredBy.email}</span>
                    ) : (
                      <span style={{ color: "var(--text-2)", fontSize: 12 }}>—</span>
                    )}
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {u.isBanned && <Badge color="#f87171">Banned</Badge>}
                      {u.isOnline && <Badge color="#10b981">Online</Badge>}
                      {u.role === "admin" && <Badge color="#a78bfa">Admin</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openDetail(u.id)} className="admin-btn" style={{ fontSize: 12, padding: "4px 10px" }}>👁 Xem</button>
                      {u.codeChangedAt && (
                        <button onClick={() => resetCode(u.id)} className="admin-btn" style={{ fontSize: 12, padding: "4px 10px" }}>🔄 Reset</button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "grid", placeItems: "center", zIndex: 9999, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 16, maxWidth: 720, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-0)" }}>👤 @{detail.user.username}</h2>
              <button onClick={() => setDetail(null)} style={{ background: "transparent", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-2)" }}>×</button>
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
              <Row label="Email" value={detail.user.email} />
              <Row label="SĐT" value={detail.user.phone || "—"} />
              <Row label="Mã GT" value={detail.user.referralCode || "⚠️ Chưa có"} />
              <Row label="Đổi mã lúc" value={detail.user.codeChangedAt ? new Date(detail.user.codeChangedAt).toLocaleString("vi-VN") : "Chưa đổi"} />
              <Row label="Số dư" value={fmt(detail.user.balance)} />
              <Row label="Hoa hồng" value={fmt(detail.user.commission)} />
              <Row label="Đã mời" value={`${detail.invited.length} người`} />
            </div>

            {detail.referredBy && (
              <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 8 }}>🔗 Được mời bởi</div>
                <div style={{ fontSize: 14, color: "var(--text-0)" }}>@{detail.referredBy.username || detail.referredBy.email}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
                  Hoa hồng: {fmt(detail.referredBy.commission)} • {detail.referredBy.commissionPaid ? "✅ Đã trả" : "⏳ Chờ"}
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 10 }}>
              👥 Danh sách đã mời ({detail.invited.length})
            </div>
            {detail.invited.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 10, fontSize: 13 }}>
                Chưa mời ai
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {detail.invited.map((i) => (
                  <div key={i.id} style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-0)" }}>@{i.username || i.email}</div>
                      <div style={{ fontSize: 11, color: "var(--text-2)" }}>Mã: {i.code} • {new Date(i.joinedAt).toLocaleDateString("vi-VN")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: i.commissionPaid ? "#10b981" : "#fbbf24" }}>{fmt(i.commission)}</div>
                      <div style={{ fontSize: 11, color: "var(--text-2)" }}>{i.commissionPaid ? "✅ Đã trả" : "⏳ Chờ"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {detail.user.codeChangedAt && (
              <button onClick={() => { resetCode(detail.user.id); setDetail(null); }} className="admin-btn" style={{ marginTop: 20, width: "100%" }}>
                🔄 Reset mã (cho user đổi lại)
              </button>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="admin-btn" style={{ background: active ? "var(--accent)" : undefined, color: active ? "#fff" : undefined, fontSize: 13, padding: "8px 14px" }}>
      {children}
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, fontWeight: 800, color: "var(--text-2)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "12px 14px", fontSize: 13 }}>{children}</td>;
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: `${color}22`, color }}>
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "var(--text-2)", fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 700, color: "var(--text-0)", fontSize: 13, textAlign: "right" }}>{value}</span>
    </div>
  );
}
