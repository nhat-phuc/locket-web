




/**
 * Thông báo admin khi có user truy cập
 */
export async function notifyAdminUserVisit(user: {
  username: string;
  email: string;
  name?: string | null;
  time?: Date;
}): Promise<{ success: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[telegram] Chua cau hinh token/chatId");
    return { success: false };
  }

  const time = user.time || new Date();
  const lines = [
    "<b>USER TRUY CAP</b>",
    "",
    "Username: @" + user.username,
    "Email: " + user.email,
  ];
  if (user.name) lines.push("Ten: " + user.name);
  lines.push("Luc: " + time.toLocaleString("vi-VN"));
  const message = lines.join("\n");

  try {
    const url = "https://api.telegram.org/bot" + token + "/sendMessage";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (!data.ok) console.error("[telegram] Loi:", data);
    return { success: data.ok };
  } catch (error) {
    console.error("[telegram] fetch error:", error);
    return { success: false };
  }
}

export async function notifyAdminGroup(message: string): Promise<{ success: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_GROUP_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[telegram] Chưa cấu hình token/group");
    return { success: false };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const data = await res.json();
    return { success: data.ok };
  } catch (error) {
    console.error("[telegram] group error:", error);
    return { success: false };
  }
}

export async function notifyNewRegister(user: { username: string; email: string; name?: string | null }): Promise<void> {
  const msg = [
    "🆕 <b>ĐĂNG KÝ MỚI</b>",
    "",
    `👤 Username: <code>@${user.username}</code>`,
    `📧 Email: ${user.email}`,
    user.name ? `📛 Tên: ${user.name}` : "",
    `⏰ ${new Date().toLocaleString("vi-VN")}`,
  ].filter(Boolean).join("\n");
  await notifyAdminGroup(msg);
}

export async function notifyUserLogin(user: { username: string; email: string; method?: string }): Promise<void> {
  const msg = [
    "🔑 <b>ĐĂNG NHẬP</b>",
    "",
    `👤 Username: <code>@${user.username}</code>`,
    `📧 Email: ${user.email}`,
    `🔐 Phương thức: ${user.method || "password"}`,
    `⏰ ${new Date().toLocaleString("vi-VN")}`,
  ].join("\n");
  await notifyAdminGroup(msg);
}

export async function notifyRechargeCreated(data: { username: string; email: string; amount: number; orderCode: string }): Promise<void> {
  const msg = [
    "💳 <b>YÊU CẦU NẠP TIỀN</b>",
    "",
    `👤 Username: <code>@${data.username}</code>`,
    `📧 Email: ${data.email}`,
    `💰 Số tiền: <b>${data.amount.toLocaleString("vi-VN")}đ</b>`,
    `📋 Mã đơn: <code>${data.orderCode}</code>`,
    `⏰ ${new Date().toLocaleString("vi-VN")}`,
  ].join("\n");
  await notifyAdminGroup(msg);
}

export async function notifyOrderCreated(data: { username: string; email: string; amount: number; orderCode: string; serviceName: string }): Promise<void> {
  const msg = [
    "🛒 <b>ĐƠN HÀNG MỚI</b>",
    "",
    `👤 Username: <code>@${data.username}</code>`,
    `📧 Email: ${data.email}`,
    `🎁 Dịch vụ: ${data.serviceName}`,
    `💰 Số tiền: <b>${data.amount.toLocaleString("vi-VN")}đ</b>`,
    `�� Mã đơn: <code>${data.orderCode}</code>`,
    `⏰ ${new Date().toLocaleString("vi-VN")}`,
  ].join("\n");
  await notifyAdminGroup(msg);
}

export async function notifyWithdrawalRequest(data: { username: string; email: string; amount: number; bankName: string; bankAccount: string }): Promise<void> {
  const msg = [
    "💸 <b>YÊU CẦU RÚT TIỀN</b>",
    "",
    `👤 Username: <code>@${data.username}</code>`,
    `📧 Email: ${data.email}`,
    `💰 Số tiền: <b>${data.amount.toLocaleString("vi-VN")}đ</b>`,
    `🏦 Ngân hàng: ${data.bankName}`,
    `💳 Số TK: <code>${data.bankAccount}</code>`,
    `⏰ ${new Date().toLocaleString("vi-VN")}`,
  ].join("\n");
  await notifyAdminGroup(msg);
}
