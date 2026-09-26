const features = [
  { color: "var(--accent-bright)", title: "Mở khóa tính năng Gold", desc: "Sử dụng toàn bộ các tính năng cao cấp của gói Locket Gold Premium vĩnh viễn." },
  { color: "var(--red)", title: "Không quảng cáo", desc: "Trải nghiệm mượt mà, sạch bóng không một cọng quảng cáo khó chịu." },
  { color: "var(--green)", title: "Upload ảnh từ thư viện", desc: "Lấy ảnh trực tiếp từ camera roll để gửi nhanh cho bạn bè thay vì chụp mới." },
  { color: "#F59E0B", title: "Quay video Lockets 15s", desc: "Quay video Lockets lên đến 15s (LUXURY) hoặc 3s (VIP & Android)." },
  { color: "#3B82F6", title: "Xem người đã xem Lockets", desc: "Xem danh sách những ai đã xem Lockets của bạn (iOS)." },
  { color: "#EC4899", title: "Thay đổi icon Locket", desc: "Làm mới màn hình chính với bộ icon Locket viền vàng Gold quyền lực." },
  { color: "#8B5CF6", title: "Thay đổi theme Locket", desc: "Cá nhân hóa màu sắc giao diện theo sở thích." },
  { color: "#14B8A6", title: "Mở khóa giới hạn bạn bè", desc: "Xoá bỏ rào cản, thêm vô số bạn bè không bị giới hạn." },
  { color: "#10B981", title: "Tặng Canva Edu 3 Năm", desc: "Tặng kèm tài khoản Canva Edu bản quyền 3 năm (trị giá 60k)." },
];

export default function FeatureMarquee() {
  const doubled = [...features, ...features];
  return (
    <>
      <div style={{ textAlign: "center", marginTop: 60, marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, #C084FC, #F472B6)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Các Tính Năng Độc Quyền
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>Nâng cấp trải nghiệm với bộ công cụ mạnh mẽ và xịn xò nhất hiện nay.</p>
      </div>

      <div className="marquee-wrapper compact">
        <div className="marquee-track left" style={{ animationDuration: "35s" }}>
          {doubled.map((f, i) => (
            <div className="feature-card" key={`l-${i}`}>
              <div style={{ color: f.color, marginBottom: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: f.color, opacity: 0.8 }} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "var(--text-0)" }}>{f.title}</h3>
              <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.4, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="marquee-track right" style={{ animationDuration: "35s" }}>
          {doubled.map((f, i) => (
            <div className="feature-card" key={`r-${i}`}>
              <div style={{ color: f.color, marginBottom: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: f.color, opacity: 0.8 }} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "var(--text-0)" }}>{f.title}</h3>
              <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.4, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
