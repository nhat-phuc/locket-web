import { stepsList } from "@/lib/data";

export default function Steps() {
  return (
    <>
      <div style={{ marginTop: 80, marginBottom: 40, textAlign: "center" }}>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 12,
            color: "var(--text-0)",
          }}
        >
          Sở Hữu Locket Gold Chỉ Với 3 Bước
        </h2>
        <p
          style={{
            color: "var(--text-2)",
            fontSize: 15,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          Quá trình nâng cấp diễn ra hoàn toàn tự động trong chưa đầy 1 phút. Không rườm rà, không chờ đợi.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          marginBottom: 60,
        }}
      >
        {stepsList.map((s) => (
          <div className="step-card" key={s.n}>
            <div
              className="step-number"
              style={{ background: s.color, color: s.textColor }}
            >
              {s.n}
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--text-0)",
                marginBottom: 10,
              }}
            >
              {s.title}
            </h3>
            <p
              style={{
                fontSize: 14.5,
                color: "var(--text-2)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
