export type TransactionType = "deposit" | "withdraw" | "purchase" | "refund" | "bonus";
export type TransactionStatus = "pending" | "success" | "failed" | "cancelled";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  method?: string;
  reference?: string;
  description: string;
  orderId?: string;
  createdAt: string | Date;
  completedAt?: string | Date;
}

export interface PaymentQR {
  qrUrl: string;
  orderCode: string;
  amount: number;
  content: string;
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  expiresAt: string | Date;
}
