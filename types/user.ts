export type UserRole = "user" | "admin" | "moderator";

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  picture?: string;
  phone?: string;
  role: UserRole;
  balance: number;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserPublic {
  id: string;
  email: string;
  username: string;
  name?: string;
  picture?: string;
  balance: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  name?: string;
}

