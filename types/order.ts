export type OrderStatus = "pending" | "paid" | "processing" | "completed" | "cancelled" | "expired";
export type PaymentMethod = "bank_transfer" | "momo" | "zalopay" | "balance";

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  serviceId: string;
  packageId?: string;
  serviceName: string;
  amount: number;
  discount: number;
  finalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  note?: string;
  locketUsername?: string;
  locketLink?: string;
  createdAt: string | Date;
  paidAt?: string | Date;
  completedAt?: string | Date;
  expiresAt?: string | Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceName: string;
  price: number;
  quantity: number;
}
