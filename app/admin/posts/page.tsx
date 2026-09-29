"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categoryColor: string;
  author: string;
  image: string | null;
  tags: string;
  readTime: string;
  views: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadPosts = () => {
    setLoading(true);
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPosts(d.posts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (post: Post) => {
    if (!confirm(`Xóa bài viết "${post.title}"?`)) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setToast("Đã xóa bài viết");
      loadPosts();
      setTimeout(() => setToast(null), 3000);
    } else {
      alert(data.message || "Lỗi");
    }
  };

  return (
    <>
      <style>{`
        .admin-post-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          font-family: inherit;
        }
        .admin-post-btn:hover { transform: translateY(-2px); }

        .admin-post-table {
          width: 100%;
          border-collapse: collapse;
          background: linear-gradient(145deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
          border: 1.5px solid var(--border);
          border-radius: 18px;
          overflow: hidden;
        }
        .admin-post-table th {
          padding: 14px 12px;
          text-align: left;
          font-size: 11px;
          color: var(--text-2);
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: rgba(167,139,250,.06);
        }
        .admin-post-table td {
          padding: 14px 12px;
          font-size: 13.5px;
          border-bottom: 1px solid rgba(167,139,250,.06);
        }
        .admin-post-table tr:last-child td { border-bottom: none; }
        .admin-post-table tr:hover td { background: rgba(167,139,250,.03); }

        .admin-post-action {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid rgba(167,139,250,.25);
          background: rgba(167,139,250,.08);
          color: #c4b5fd;
          font-family: inherit;
          margin-right: 4px;
        }
        .admin-post-action.danger {
          border-color: rgba(248,113,113,.3);
          background: rgba(248,113,113,.08);
          color: #f87171;
        }

        .admin-post-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .admin-post-badge.published { background: rgba(74,222,128,.15); color: #4ade80; }
        .admin-post-badge.draft { background: rgba(251,191,36,.15); color: #fbbf24; }

        .admin-post-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: rgba(34,197,94,.95);
          color: #fff;
          padding: 14px 22px;
          border-radius: 14px;
          font-size: 13.5px;
          font-weight: 700;
          z-index: 9999;
        }
      `}</style>

      <AdminPage
        title="Bài viết"
        description={`Quản lý blog — ${posts.length} bài viết`}
        actions={
          <button className="admin-post-btn" onClick={() => { setEditing(null); setModalOpen(true); }}>
            ➕ Thêm bài viết
          </button>
        }
      >
        {loading ? (
          <p style={{ textAlign: "center", padding: 40, color: "var(--text-2)" }}>Đang tải...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center", padding: 60, color: "var(--text-2)" }}>Chưa có bài viết nào</p>
        ) : (
          <table className="admin-post-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.title}</td>
                  <td>{p.category}</td>
                  <td>{p.author}</td>
                  <td>{p.views}</td>
                  <td>
                    <span className={`admin-post-badge ${p.isPublished ? "published" : "draft"}`}>
                      {p.isPublished ? "Đã đăng" : "Nháp"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-2)", fontSize: 12 }}>
                    {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="admin-post-action" onClick={() => { setEditing(p); setModalOpen(true); }}>
                      ✏️ Sửa
                    </button>
                    <button className="admin-post-action danger" onClick={() => handleDelete(p)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminPage>

      {modalOpen && (
        <PostModal
          post={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadPosts();
            setToast(editing ? "Đã cập nhật" : "Đã thêm bài viết");
            setTimeout(() => setToast(null), 3000);
          }}
        />
      )}

      {toast && <div className="admin-post-toast">✅ {toast}</div>}
    </>
  );
}

/* ═══════════════════════════════════════════
   MODAL THÊM/SỬA
   ═══════════════════════════════════════════ */
function PostModal({ post, onClose, onSaved }: { post: Post | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!post;
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    category: post?.category || "Tin tức",
    categoryColor: post?.categoryColor || "#a78bfa",
    author: post?.author || "Admin",
    image: post?.image || "",
    tags: post?.tags || "",
    readTime: post?.readTime || "5 phút",
    isFeatured: post?.isFeatured ?? false,
    isPublished: post?.isPublished ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const autoSlug = () => {
    const s = form.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    update("slug", s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.slug || !form.content) {
      setError("Vui lòng nhập tiêu đề, slug, nội dung");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/posts/${post!.id}` : "/api/admin/posts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) onSaved();
      else setError(data.message || "Lỗi");
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .post-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.75);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }
        .post-modal {
          width: 100%;
          max-width: 720px;
          background: linear-gradient(180deg, #14142a, #0f0f1f);
          border: 1px solid rgba(167,139,250,.2);
          border-radius: 20px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 28px;
        }
        .post-modal h2 {
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 20px;
          color: #f5f5ff;
        }
        .post-modal-field {
          margin-bottom: 16px;
        }
        .post-modal-field label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #c7c5db;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .post-modal-field input,
        .post-modal-field textarea,
        .post-modal-field select {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(0,0,0,.3);
          border: 1px solid rgba(167,139,250,.15);
          color: #f5f5ff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
        }
        .post-modal-field textarea {
          resize: vertical;
          min-height: 120px;
        }
        .post-modal-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .post-modal-error {
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(248,113,113,.1);
          border: 1px solid rgba(248,113,113,.3);
          color: #f87171;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .post-modal-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          color: #c7c5db;
          margin-bottom: 12px;
        }
        .post-modal-checkbox input { width: 18px; height: 18px; accent-color: #a78bfa; }
        .post-modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 24px;
        }
        .post-modal-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .post-modal-btn.cancel {
          background: rgba(255,255,255,.06);
          color: #c7c5db;
          border: 1px solid rgba(255,255,255,.1);
        }
        .post-modal-btn.save {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: #fff;
        }
        .post-modal-btn.save:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      <div className="post-modal-overlay" onClick={onClose}>
        <form className="post-modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <h2>{isEdit ? "✏️ Sửa bài viết" : "➕ Thêm bài viết"}</h2>

          {error && <div className="post-modal-error">❌ {error}</div>}

          <div className="post-modal-field">
            <label>Tiêu đề *</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Tiêu đề bài viết" required />
          </div>

          <div className="post-modal-field">
            <label>Slug *</label>
            <input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="tieu-de-bai-viet" required />
            <button type="button" onClick={autoSlug} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 11, cursor: "pointer", padding: 0, marginTop: 4 }}>
              → Tự tạo từ tiêu đề
            </button>
          </div>

          <div className="post-modal-field">
            <label>Mô tả ngắn</label>
            <textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="Mô tả ngắn về bài viết" style={{ minHeight: 70 }} />
          </div>

          <div className="post-modal-field">
            <label>Nội dung *</label>
            <textarea value={form.content} onChange={(e) => update("content", e.target.value)} placeholder="Nội dung bài viết..." required />
          </div>

          <div className="post-modal-row">
            <div className="post-modal-field">
              <label>Danh mục</label>
              <input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Tin tức" />
            </div>
            <div className="post-modal-field">
              <label>Màu danh mục</label>
              <input type="color" value={form.categoryColor} onChange={(e) => update("categoryColor", e.target.value)} style={{ height: 44, padding: 4 }} />
            </div>
          </div>

          <div className="post-modal-row">
            <div className="post-modal-field">
              <label>Tác giả</label>
              <input value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="Admin" />
            </div>
            <div className="post-modal-field">
              <label>Thời gian đọc</label>
              <input value={form.readTime} onChange={(e) => update("readTime", e.target.value)} placeholder="5 phút" />
            </div>
          </div>

          <div className="post-modal-field">
            <label>Ảnh thumbnail (URL)</label>
            <input value={form.image} onChange={(e) => update("image", e.target.value)} placeholder="/upload/bai-viet/anh.jpg" />
          </div>

          <div className="post-modal-field">
            <label>Tags</label>
            <input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="locket, gold, vip" />
          </div>

          <label className="post-modal-checkbox">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
            ⭐ Bài viết nổi bật
          </label>

          <label className="post-modal-checkbox">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} />
            ✅ Xuất bản (hiển thị công khai)
          </label>

          <div className="post-modal-actions">
            <button type="button" className="post-modal-btn cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="post-modal-btn save" disabled={saving}>
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm bài viết"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
