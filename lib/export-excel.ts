import * as XLSX from "xlsx";

export function exportToExcel(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportUsersExcel(users: any[]) {
  const data = users.map((u) => ({
    Email: u.email,
    Username: u.username,
    "Tên": u.name || "",
    "SĐT": u.phone || "",
    "Số dư": u.balance,
    "Vai trò": u.role,
    "Trạng thái": u.isBanned ? "Bị cấm" : "Hoạt động",
    "Ngày tạo": new Date(u.createdAt).toLocaleString("vi-VN"),
  }));
  exportToExcel(data, "users");
}

export function exportOrdersExcel(orders: any[]) {
  const data = orders.map((o) => ({
    "Mã đơn": o.orderCode,
    "Khách hàng": o.user?.email || "",
    "Dịch vụ": o.serviceName,
    "Số tiền": o.finalAmount,
    "Trạng thái": o.status,
    "Ngày thanh toán": o.paidAt ? new Date(o.paidAt).toLocaleString("vi-VN") : "",
  }));
  exportToExcel(data, "orders");
}
