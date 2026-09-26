"use client";

import { useEffect, useState } from "react";
import AdminPage from "@/components/admin/AdminPage";
import DataTable from "@/components/admin/DataTable";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPosts(d.posts); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AdminPage title="Bài viết" description="Quản lý blog và tin tức">
      <DataTable
        loading={loading}
        data={posts}
        emptyMessage="Chưa có bài viết nào"
        columns={[
          { key: "title", label: "Tiêu đề" },
          { key: "category", label: "Danh mục" },
          { key: "author", label: "Tác giả" },
          { key: "views", label: "Lượt xem" },
          { key: "isPublished", label: "Xuất bản", render: (v) => <span className={`status-badge ${v ? "paid" : "pending"}`}>{v ? "Đã đăng" : "Nháp"}</span> },
          { key: "createdAt", label: "Ngày tạo", render: (v) => new Date(v).toLocaleDateString("vi-VN") },
        ]}
      />
    </AdminPage>
  );
}
