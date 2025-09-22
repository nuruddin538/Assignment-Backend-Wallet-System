import { Types } from "mongoose";

export enum WalletStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IWallet {
  _id?: Types.ObjectId;
  walletId: string;
  userId: Types.ObjectId;
  balance: number;
  status: WalletStatus;
  pin: string;
  createdAt?: Date;
  updatedAt?: Date;
}
