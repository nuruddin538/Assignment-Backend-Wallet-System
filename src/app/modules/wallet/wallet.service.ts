/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";
import { WalletDocument, WalletStatus } from "./wallet.interface";
import { Transaction } from "../transaction/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { UserModel } from "../user/user.model";
import { calculateFee } from "../../utils/helpers";

const createWallet = async (userId: string, pin: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if wallet already exists
    const existingWallet =
      ((await Wallet.findOne({ userId })
        .select("+pin")
        .session(session)) as WalletDocument) || null;
    if (existingWallet) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Wallet already exists for this user"
      );
    }
    // Create wallet
    const wallet = await Wallet.create(
      [
        {
          userId,
          pin,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return wallet[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }
  return wallet;
};

const updateWalletStatus = async (
  walletId: string,
  status: WalletStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  adminId: string
) => {
  const wallet = await Wallet.findOneAndUpdate(
    { walletId },
    { status },
    { new: true, runValidators: true }
  );
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }
  return wallet;
};

const addMoney = async (userId: string, amount: number, pin: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const wallet = await Wallet.findOne({ userId })
      .select("+pin")
      .session(session);
    if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }
    if (wallet.status === WalletStatus.BLOCKED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Wallet is blocked. Cannot perform transaction."
      );
    }
    // Verify PIN
    const isPinValid = await wallet.comparePin(pin);
    if (!isPinValid) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid PIN");
    }

    // Update wallet balance
    wallet.balance += amount;
    await wallet.save({ session });

    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          senderWalletId: wallet._id,
          amount,
          fee: 0,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          description: `Deposit of ${amount}`,
          initiatedBy: userId,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return { wallet, transaction: transaction[0] };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const transferMoney = async (
  userId: string,
  receiverWalletId: string,
  amount: number,
  pin: string,
  description?: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const senderWallet = await Wallet.findOne({ userId })
      .select("+pin")
      .session(session);
    if (!senderWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender wallet not found");
    }
    if (senderWallet.status === WalletStatus.BLOCKED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Your wallet is blocked. Cannot perform transactions."
      );
    }
    // Verify PIN
    const isPinValid = await senderWallet.comparePin(pin);
    if (!isPinValid) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid PIN");
    }
    const receiverWallet = await Wallet.findOne({
      walletId: receiverWalletId,
    }).session(session);
    if (!receiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found");
    }
    if (senderWallet.balance < amount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }
    // Calculate transfer fee
    const fee = calculateFee(amount, 0.5);
    const totalAmount = amount + fee;

    if (senderWallet.balance < totalAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Insufficient balance to cover amount + fee"
      );
    }

    // Update sender balance
    senderWallet.balance -= totalAmount;
    await senderWallet.save({ session });

    // Update receiver balance
    receiverWallet.balance += amount;
    await receiverWallet.save({ session });

    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          senderWalletId: senderWallet._id,
          receiverWalletId: receiverWallet._id,
          amount,
          fee,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          description: description || `Transfer to ${receiverWallet}`,
          initiatedBy: userId,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return { senderWallet, transaction: transaction[0] };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cashIn = async (
  agentId: string,
  walletId: string,
  amount: number,
  pin: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Check if agent is approved
    const agent = await UserModel.findById(agentId).session(session);
    if (agent?.role !== "AGENT" || agent.approvalStatus !== "approved") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Agent not approved for transaction"
      );
    }
    const agentWallet = await Wallet.findOne({ userId: agentId })
      .select("+pin")
      .session(session);
    if (!agentWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }
    // Verify agent PIN
    const isPinValid = await agentWallet.comparePin(pin);
    if (!isPinValid) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid PIN");
    }
    const userWallet = await Wallet.findOne({ walletId }).session(session);
    if (!userWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }
    if (userWallet.status === WalletStatus.BLOCKED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Wallet is blocked. Cannot perform transactions."
      );
    }
    // Update user wallet balance
    userWallet.balance += amount;
    await userWallet.save({ session });

    // Calculate agent commission
    const commission = calculateFee(amount, 0.5); // 0.5% commission for agent

    // Update agent's total commission
    await UserModel.findByIdAndUpdate(
      agentId,
      { $inc: { totalCommission: commission } },
      { session }
    );
    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          senderWalletId: userWallet._id,
          amount,
          fee: 0,
          type: TransactionType.CASH_IN,
          status: TransactionStatus.COMPLETED,
          description: `Cash-in of ${amount} by agent`,
          initiatedBy: agentId,
          processedBy: agentId,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return { wallet: userWallet, transaction: transaction[0], commission };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
export const WalletServices = {
  createWallet,
  getWallet,
  updateWalletStatus,
  addMoney,
  transferMoney,
  cashIn,
};
