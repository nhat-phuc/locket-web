import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function normalizeUsername(input: string): string {
  let u = input.trim();
  // Nếu là link → trích username
  const match = u.match(/locket\.(cam|camera)\/([^/?#\s]+)/i);
  if (match) u = match[2];
  return u.replace(/^@/, "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, displayName, avatar, coverImage, badge, bio, age, gender, interests, profileUrl } = body;

    if (!username) {
      return NextResponse.json({ success: false, message: "Thiếu username" }, { status: 400 });
    }

    const clean = normalizeUsername(username);

    if (!/^[a-zA-Z0-9_.]{2,30}$/.test(clean)) {
      return NextResponse.json({ success: false, message: "Username không hợp lệ" }, { status: 400 });
    }

    // Check username tồn tại trên Locket
    const checkRes = await fetch(`https://locket.cam/${clean}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await checkRes.text();
    const hasProfile = /profile-pic-img|locket\.page\.link/i.test(html);

    if (!hasProfile) {
      return NextResponse.json({ success: false, message: "Username không tồn tại trên Locket" }, { status: 404 });
    }

    // Trích avatar từ HTML nếu có
    let avatarUrl = avatar || null;
    if (!avatarUrl) {
      const avatarMatch = html.match(/class="profile-pic-img"\s+src="([^"]+)"/i);
      if (avatarMatch) avatarUrl = avatarMatch[1].replace(/&amp;/g, "&");
    }

    // Upsert
    const existing = await prisma.locketProfile.findUnique({ where: { username: clean } });

    let profile;
    if (existing) {
      profile = await prisma.locketProfile.update({
        where: { username: clean },
        data: {
          displayName: displayName || existing.displayName,
          avatar: avatarUrl || existing.avatar,
          coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
          badge: badge !== undefined ? badge : existing.badge,
          bio: bio || existing.bio,
          age: age || existing.age,
          gender: gender || existing.gender,
          interests: interests ? JSON.stringify(interests) : existing.interests,
          profileUrl: profileUrl || `https://locket.cam/${clean}`,
        },
      });
    } else {
      profile = await prisma.locketProfile.create({
        data: {
          username: clean,
          displayName: displayName || null,
          avatar: avatarUrl,
          coverImage: coverImage || null,
          badge: badge || null,
          bio: bio || null,
          age: age || null,
          gender: gender || null,
          interests: interests ? JSON.stringify(interests) : null,
          profileUrl: profileUrl || `https://locket.cam/${clean}`,
          savedBy: null,
        },
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("[locket/save]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
