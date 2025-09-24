import { Document, Model, Types } from "mongoose";

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

// instance methods
export interface IWalletMethods {
  comparePin(candidatePin: string): Promise<boolean>;
}

// document type (fields + methods)
export type WalletDocument = Document & IWallet & IWalletMethods;

// model type (so schema knows about methods)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WalletModel extends Model<IWallet, {}, IWalletMethods> {}
