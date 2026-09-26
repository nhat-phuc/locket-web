export type ServiceType = "gold" | "vip" | "luxury" | "adr" | "agent";
export type Platform = "ios" | "android";

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: ServiceType;
  platform: Platform;
  price: number;
  originalPrice?: number;
  discount?: number;
  duration?: string;
  features: string[];
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  stock?: number;
  sold: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isPopular: boolean;
  order: number;
}
