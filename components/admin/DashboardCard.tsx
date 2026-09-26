interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  trend?: string;
}

export default function DashboardCard({ label, value, icon, color = "var(--accent)", trend }: DashboardCardProps) {
  return (
    <div className="dashboard-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        {trend && <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>{trend}</span>}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}
