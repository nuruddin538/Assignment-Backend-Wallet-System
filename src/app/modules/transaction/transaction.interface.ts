import { Types } from "mongoose";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER = "TRANSFER",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}

export interface ITransaction {
  _id?: Types.ObjectId;
  transactionId: string;
  senderWalletId: Types.ObjectId;
  receiverWalletId?: Types.ObjectId;
  amount: number;
  fee: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  initiatedBy: Types.ObjectId;
  processedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
