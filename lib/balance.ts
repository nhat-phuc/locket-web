import { prisma } from "@/lib/db";

/**
 * Trừ tiền khi thanh toán:
 * 1. Trừ `bonusBalance` trước (tiền vòng quay)
 * 2. Nếu thiếu → trừ `balance` (tiền nạp)
 *
 * VD: User có 20k bonus + 100k balance. Mua gói 50k
 * → Trừ 20k bonus + 30k balance = 50k
 */
export async function deductPayment(
  tx: any,
  userId: string,
  amount: number
): Promise<{ fromBonus: number; fromBalance: number; newBonus: number; newBalance: number }> {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User không tồn tại");

  const fromBonus = Math.min(user.bonusBalance, amount);
  const fromBalance = amount - fromBonus;
  const newBonus = user.bonusBalance - fromBonus;
  const newBalance = user.balance - fromBalance;

  if (newBalance < 0) throw new Error("Số dư không đủ");

  await tx.user.update({
    where: { id: userId },
    data: { bonusBalance: newBonus, balance: newBalance },
  });

  return { fromBonus, fromBalance, newBonus, newBalance };
}

/**
 * Rút tiền: CHỈ rút từ `balance`, KHÔNG được rút `bonusBalance`
 */
export function canWithdraw(user: { balance: number; bonusBalance: number }, amount: number): boolean {
  return user.balance >= amount; // Chỉ check balance, không check bonusBalance
}

/**
 * Tổng tiền khả dụng để thanh toán = balance + bonusBalance
 */
export function getTotalBalance(user: { balance: number; bonusBalance: number }): number {
  return user.balance + user.bonusBalance;
}
