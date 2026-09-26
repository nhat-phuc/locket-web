const stats = [
  { value: "28,860", color: "var(--text-0)", label: "Thành viên" },
  { value: "2,438", color: "var(--accent-bright)", label: "Lượt sử dụng" },
  { value: "127", color: "#ef4444", label: "Tài khoản GOLD" },
  { value: "1,521", color: "var(--green)", label: "Tài khoản VIP" },
  { value: "443", color: "#fbbf24", label: "Tài khoản LUXURY" },
  { value: "276", color: "#4ADE80", label: "Tài khoản ADR" },
];

export default function Stats() {
  return (
    <div className="stats-container">
      {stats.map((s, i) => (
        <div className="stat-box" key={i}>
          <div className="stat-value" style={{ color: s.color }}>
            {s.value}
          </div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
