import { getSession } from "./session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Chưa đăng nhập", status: 401 };
  }
  if (session.role !== "admin") {
    return { ok: false, message: "Không có quyền admin", status: 403 };
  }
  return { ok: true, session };
}
