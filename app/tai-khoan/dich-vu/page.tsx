export default function DichVuPage() {
  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Dịch vụ đã mua</h1>
      <div style={{ padding: 60, textAlign: "center", color: "var(--text-2)", background: "var(--bg-1)", borderRadius: 16, border: "1px dashed var(--border)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Chưa có dịch vụ nào</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>Mua dịch vụ tại <a href="/bang-gia" style={{ color: "var(--accent-bright)" }}>Bảng giá</a></p>
      </div>
    </>
  );
}
