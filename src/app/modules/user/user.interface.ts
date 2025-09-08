import { Types } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  USER = "USER",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  nid?: string;
  dateOfBirth?: Date;
  isDeleted?: boolean;
  isActive?: IsActive;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  role: UserRole;
  auths: IAuthProvider[];
  approvalStatus?: "pending" | "approved" | "rejected";
  commissionRate?: number;
  totalCommission?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAgent extends IUser {
  approvalStatus: "pending" | "approved" | "rejected";
  commissionRate: number;
  totalCommission: number;
}
