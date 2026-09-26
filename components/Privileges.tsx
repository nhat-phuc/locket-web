import { privilegesList } from "@/lib/data";

export default function Privileges() {
  return (
    <div style={{ marginTop: 80, textAlign: "left" }}>
      <h2
        style={{
          marginBottom: 16,
          fontSize: 24,
          fontWeight: 800,
          color: "var(--text-0)",
        }}
      >
        Đặc Quyền Của Các Gói Locket Gold
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "var(--text-2)",
          marginBottom: 40,
          fontSize: 15,
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Nâng cấp tài khoản để mở khóa toàn bộ sức mạnh của Locket Gold, không giới hạn tính năng và trải nghiệm trọn vẹn nhất.
      </p>

      <div className="privileges-grid">
        {privilegesList.map((p, i) => (
          <div className="privilege-card" key={i}>
            <div className="privilege-icon-wrapper">
              <span style={{ fontSize: 24, color: p.iconColor }}>{p.icon}</span>
              <div className={`privilege-status-badge ${p.badgeType}`}>
                {p.badge}
              </div>
            </div>
            <h3 className="privilege-title">{p.title}</h3>
            <p className="privilege-desc">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
