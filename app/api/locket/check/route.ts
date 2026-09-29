import { NextResponse } from "next/server";

// GET /api/locket/check?username=xxx
// Check username Locket qua link https://locket.cam/{username}
// Nếu HTML chứa "profile-pic-img" hoặc "locket.page.link" → user tồn tại

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("username");

    if (!raw || raw.trim().length < 2) {
      return NextResponse.json(
        { valid: false, message: "Username hoặc link bị sai" },
        { status: 200 }
      );
    }

    // 1. Chuẩn hóa username từ input
    let username = raw.trim();

    // Nếu user paste link dạng https://locket.cam/xxx hoặc https://locket.camera/xxx
    const urlMatch = username.match(/locket\.(cam|camera)\/([^/?#\s]+)/i);
    if (urlMatch) {
      username = urlMatch[2];
    }

    // Bỏ @ ở đầu
    username = username.replace(/^@/, "").trim();

    // Loại bỏ ký tự không hợp lệ (Locket username: a-z, 0-9, _, .)
    if (!/^[a-zA-Z0-9_.]{2,30}$/.test(username)) {
      return NextResponse.json(
        { valid: false, message: "Username hoặc link bị sai" },
        { status: 200 }
      );
    }

    // 2. Fetch HTML từ locket.cam
    const url = `https://locket.cam/${encodeURIComponent(username)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      // Không dùng cache để luôn lấy mới
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { valid: false, message: "Username hoặc link bị sai" },
        { status: 200 }
      );
    }

    const html = await res.text();

    // 3. Check dấu hiệu tồn tại
    // - Có class "profile-pic-img" (avatar thật)
    // - Có "locket.page.link" (link share profile)
    // - Có "firebasestorage.googleapis.com" với "profile_pic"
    const hasProfilePic = /class="profile-pic-img"/i.test(html);
    const hasPageLink = /locket\.page\.link/i.test(html);
    const hasFirebaseAvatar =
      /firebasestorage\.googleapis\.com[^"]*profile_pic/i.test(html);

    const valid = hasProfilePic || hasPageLink || hasFirebaseAvatar;

    if (valid) {
      // Cố gắng lấy URL avatar (nếu có)
      let avatar: string | null = null;
      const avatarMatch = html.match(
        /class="profile-pic-img"\s+src="([^"]+)"/i
      );
      if (avatarMatch) {
        avatar = avatarMatch[1].replace(/&amp;/g, "&");
      }

      return NextResponse.json({
        valid: true,
        username,
        avatar,
      });
    }

    return NextResponse.json({
      valid: false,
      message: "Username hoặc link bị sai",
    });
  } catch (error) {
    console.error("[locket/check]", error);
    return NextResponse.json(
      { valid: false, message: "Không thể kiểm tra, vui lòng thử lại" },
      { status: 200 }
    );
  }
}
