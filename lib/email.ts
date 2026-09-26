import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("📧 [DEV MODE] Email không gửi thật:", payload);
      return true;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Locket Gold <onboarding@resend.dev>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return false;
    }

    console.log("✅ Email sent:", data?.id);
    return true;
  } catch (err) {
    console.error("❌ Email error:", err);
    return false;
  }
}

export function buildOrderConfirmationEmail(
  orderCode: string,
  amount: number,
  serviceName: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #7c3aed;">Đơn hàng đã được xác nhận</h1>
      <p>Mã đơn: <strong>${orderCode}</strong></p>
      <p>Dịch vụ: <strong>${serviceName}</strong></p>
      <p>Số tiền: <strong>${amount.toLocaleString("vi-VN")}đ</strong></p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
    </div>
  `;
}

export function buildWelcomeEmail(name: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #7c3aed;">Chào mừng ${name}!</h1>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại Locket Gold.</p>
      <p>Bắt đầu nâng cấp Locket Gold ngay hôm nay!</p>
    </div>
  `;
}