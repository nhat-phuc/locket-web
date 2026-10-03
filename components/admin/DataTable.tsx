"use client";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  /** Cho phép tùy chỉnh class cho từng ô (VD: "cell-ellipsis") */
  className?: string;
  /** Ẩn cột này trên mobile (< 640px) */
  hideOnMobile?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  /** Bật chế độ chuyển bảng thành card dọc trên mobile (mặc định: true) */
  responsive?: boolean;
}

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = "Không có dữ liệu",
  responsive = true,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="admin-table-loading">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className={`admin-table ${responsive ? "responsive" : ""}`}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.hideOnMobile ? "hide-mobile" : ""}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="admin-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    data-label={c.label}
                    className={`${c.className || ""} ${c.hideOnMobile ? "hide-mobile" : ""}`.trim()}
                  >
                    {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
