import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Không có quyền" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, adminNote } = body;

    // Validate action
    if (!["approve", "reject", "complete"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action không hợp lệ" },
        { status: 400 }
      );
    }

    // Tìm withdrawal
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy yêu cầu" },
        { status: 404 }
      );
    }

    // Map action → status
    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      complete: "completed",
    };

    const newStatus = statusMap[action];

    // Nếu reject → hoàn tiền lại cho user
    if (action === "reject" && withdrawal.status === "pending") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } },
        }),
        prisma.transaction.create({
          data: {
            userId: withdrawal.userId,
            type: "refund",
            amount: withdrawal.amount,
            balanceBefore: 0,
            balanceAfter: 0,
            status: "success",
            method: "withdrawal_refund",
            description: `Hoàn tiền do yêu cầu rút bị từ chối`,
            completedAt: new Date(),
          },
        }),
      ]);
    }

    // Update withdrawal
    const updated = await prisma.withdrawalRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminNote: adminNote || null,
        processedBy: session.userId,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Đã duyệt yêu cầu"
          : action === "reject"
          ? "Đã từ chối và hoàn tiền"
          : "Đã đánh dấu hoàn thành",
      withdrawal: updated,
    });
  } catch (error) {
    console.error("[admin/withdrawals PATCH]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
