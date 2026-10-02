"use client";

import { useState, useRef } from "react";

export default function DanhGiaDichVu() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "err", text: "Vui lòng chọn file ảnh." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "err", text: "Ảnh không được vượt quá 5MB." });
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setMessage({ type: "err", text: "Vui lòng nhập nội dung đánh giá." });
      return;
    }
    if (!image) {
      setMessage({ type: "err", text: "Vui lòng đính kèm ảnh màn hình." });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("image", image);

      const res = await fetch("/api/danh-gia", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "ok", text: "✅ Cảm ơn bạn đã gửi đánh giá!" });
        setContent("");
        setImage(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setMessage({ type: "err", text: data.error || "Gửi thất bại." });
      }
    } catch {
      setMessage({ type: "err", text: "Lỗi kết nối. Vui lòng thử lại." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 32,
        padding: 20,
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderRadius: 16,
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
        ⭐ Đánh giá dịch vụ
      </h2>
      <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 20 }}>
        Chia sẻ cảm nhận của bạn về dịch vụ — có thể kèm ảnh chụp màn hình.
      </p>

      <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        Nội dung đánh giá <span style={{ color: "#ef4444" }}>*</span>
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết đánh giá của bạn (vd: uy tín, kích hoạt nhanh, nhiệt tình, ...)"
        rows={4}
        style={{
          width: "100%",
          padding: 14,
          border: "1px solid var(--border)",
          borderRadius: 12,
          fontSize: 15,
          fontFamily: "inherit",
          resize: "vertical",
          outline: "none",
          background: "var(--bg-2, #fafafa)",
          color: "var(--text-1)",
          boxSizing: "border-box",
        }}
      />

      <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
        Ảnh đính kèm màn hình Locket Gold <span style={{ color: "#ef4444" }}>*</span>
      </label>

      <div
        style={{
          display: "flex",
          gap: 16,
          padding: 16,
          border: "1px solid var(--border)",
          borderRadius: 12,
          background: "var(--bg-2, #fafafa)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 120,
            background: "linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            flexShrink: 0,
          }}
        >
          📱
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            📸 Chụp ảnh giống ảnh này
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
            Vui lòng mở ứng dụng Locket của bạn, chụp màn hình phần tính năng Gold như hình bên cạnh và tải lên đây.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
        <div style={{ flex: 1, fontSize: 14, color: "var(--text-2)" }}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: 100,
                maxHeight: 100,
                borderRadius: 10,
                border: "2px solid #7c3aed",
                objectFit: "cover",
              }}
            />
          ) : (
            "Chưa có tệp nào được chọn..."
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: "none" }}
          id="anh-danh-gia"
        />
        <label
          htmlFor="anh-danh-gia"
          style={{
            padding: "12px 24px",
            background: "#f3e8ff",
            color: "#7c3aed",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            border: "1px solid #ddd6fe",
            whiteSpace: "nowrap",
          }}
        >
          📷 Chọn Ảnh
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={sending}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "14px",
          background: sending
            ? "#c4b5fd"
            : "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: sending ? "not-allowed" : "pointer",
          boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
        }}
      >
        {sending ? "Đang gửi..." : "Gửi đánh giá"}
      </button>

      {message && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
            background: message.type === "ok" ? "#d1fae5" : "#fee2e2",
            color: message.type === "ok" ? "#065f46" : "#991b1b",
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
