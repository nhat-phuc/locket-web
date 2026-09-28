import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY chưa cấu hình");
    return { success: false, error: "Missing RESEND_API_KEY" };
  }
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Locket Gold <onboarding@resend.dev>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
    return { success: false, error };
  }
}
