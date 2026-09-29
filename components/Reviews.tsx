"use client";

import { useState } from "react";

const reviews = [
  { name: "ho***wj", initial: "H", text: "Uy tín", time: "21 giờ trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nt19042099-1789906616.webp" },
  { name: "qp***30", initial: "Q", text: "Uy tín", time: "1 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-alexanderpham1001-1789269618.webp" },
  { name: "kl***nh", initial: "K", text: "Uy tín", time: "3 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-cuongloveconan-1789310648.webp" },
  { name: "ng***k0", initial: "N", text: "Uy tín", time: "3 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-haomilknoob-1789737511.webp" },
  { name: "hi***ii", initial: "H", text: "uy tín lắm ah", time: "4 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-huynguyen39348-1789302143.webp" },
  { name: "Ph***ng", initial: "P", text: "Uy tín", time: "4 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-mhxinhgai-1788868821.webp" },
  { name: "th***77", initial: "T", text: "Oke nha", time: "4 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nguyenhoanghiep21062008-1789208040.webp" },
  { name: "va***it", initial: "V", text: "Uy tín nha", time: "5 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nhuanh0304-1788837719.webp" },
  { name: "Ng***89", initial: "N", text: "uytin", time: "5 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nmy362685-1788929202.webp" },
  { name: "em***89", initial: "E", text: "uy tín", time: "6 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-nt19042099-1789906616.webp" },
  { name: "Ry***an", initial: "R", text: "Locket 15s an toàn", time: "6 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-quangnhat-1788742227.webp" },
  { name: "ki***09", initial: "K", text: "uy tin", time: "6 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-thitranle38-1788670297.webp" },
  { name: "tu***gt", initial: "T", text: "Uy tín", time: "6 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-tungkk000-1790093269.webp" },
  { name: "ng***nh", initial: "N", text: "Uy tín", time: "7 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-trinhkhoa310-1789266941.webp" },
  { name: "ng***om", initial: "N", text: "Locket của mình bị lỗi nhma vẫn đc sửa ❤️", time: "7 ngày trước", img: "/upload/danh-gia-locket-gold-tu-khach-hang-thitranle38-1788670297.webp" },
  { name: "vu***nn", initial: "V", text: "uy tín", time: "8 ngày trước", img: "/upload/images.jpg" },
];

export default function Reviews() {
  const [shown, setShown] = useState(8);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  return (
    <section>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-0)" }}>Đánh Giá Khách Hàng</h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>Hình ảnh thực tế từ khách hàng</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        {reviews.slice(0, shown).map((r, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 5, width: "calc((100% - 7 * 8px) / 8)" }}>
            <div style={{ width: "100%", aspectRatio: "9 / 16", borderRadius: 10, overflow: "hidden", cursor: "zoom-in" }} onClick={() => setLightboxImg(r.img)}>
              <img src={r.img} alt={r.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{r.initial}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-0)" }}>{r.name}</div>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-1)", lineHeight: 1.45 }}>{r.text}</div>
            <div style={{ fontSize: 10, color: "var(--text-2)" }}>{r.time}</div>
          </div>
        ))}
      </div>

      {/* Nút Xem thêm / Đóng lại */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 40 }}>
        {shown < reviews.length && (
          <button
            onClick={() => setShown((c) => Math.min(c + 8, reviews.length))}
            style={{ padding: "12px 28px", borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1.5px solid rgba(167,139,250,0.5)", background: "rgba(167,139,250,0.1)", color: "#a78bfa", fontFamily: "inherit" }}
          >
            ⬇ Xem thêm đánh giá
          </button>
        )}
        {shown > 8 && (
          <button
            onClick={() => setShown(8)}
            style={{ padding: "12px 28px", borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1.5px solid var(--border)", background: "rgba(255,255,255,0.03)", color: "var(--text-2)", fontFamily: "inherit" }}
          >
            ⬆ Đóng lại
          </button>
        )}
      </div>

      {lightboxImg && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", zIndex: 2147483647, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }} onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "min(520px, 90vw)", maxHeight: "88vh", borderRadius: 18, objectFit: "contain" }} />
        </div>
      )}
    </section>
  );
}
