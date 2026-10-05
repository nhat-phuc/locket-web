import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { message: 'Username không hợp lệ!' },
        { status: 400 }
      );
    }

    // TODO: Gọi API Locket thật ở đây
    // const res = await fetch(`https://locket.cam/${username}`);
    // if (!res.ok) return NextResponse.json({ message: 'Không tìm thấy user!' }, { status: 404 });

    return NextResponse.json({
      message: `Username "${username}" hợp lệ!`,
      isVip: false,
      username,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'Lỗi server!' },
      { status: 500 }
    );
  }
}
