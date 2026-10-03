import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "Locket Gold <noreply@locketgold.app>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log(`[EMAIL SKIP] Không có RESEND_API_KEY. To: ${to}, Subject: ${subject}`);
    return { success: false, skipped: true };
  }

  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    console.log(`[EMAIL SENT] ${to}`);
    return { success: true, result };
  } catch (error) {
    console.error("[EMAIL ERROR]", error);
    return { success: false, error };
  }
}

export function emailTemplate(title: string, body: string, buttonText?: string, buttonUrl?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f7;">
        <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
          <div style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">��️ Locket Gold</h1>
          </div>
          <div style="padding:30px;">
            <h2 style="color:#111;font-size:18px;margin:0 0 16px;">${title}</h2>
            <div style="color:#444;font-size:14px;line-height:1.7;">${body}</div>
            ${buttonText && buttonUrl ? `
              <div style="text-align:center;margin-top:24px;">
                <a href="${buttonUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;">
                  ${buttonText}
                </a>
              </div>
            ` : ""}
            <p style="color:#999;font-size:12px;margin-top:30px;padding-top:20px;border-top:1px solid #eee;text-align:center;">
              © 2026 Locket Gold. Mọi thắc mắc liên hệ Zalo 0344421026
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
