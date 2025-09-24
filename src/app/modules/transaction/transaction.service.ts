import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.model";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Transaction } from "./transaction.model";
import { transactionSearchableFields } from "./transaction.constants";
import { TransactionType } from "./transaction.interface";

const getTransactions = async (
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  query: Record<string, string>
) => {
  const userWallet = await Wallet.findOne({ userId });

  if (!userWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  const queryBuilder = new QueryBuilder(
    Transaction.find({
      $or: [
        { senderWalletId: userWallet._id },
        { receiverWalletId: userWallet._id },
      ],
    }).populate("senderWalletId receiverWalletId initiatedBy processedBy"),
    query
  );
  const transactionsData = queryBuilder
    .filter()
    .search(transactionSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transactionsData.build(),
    queryBuilder.getMeta(),
  ]);
  return { data, meta };
};

const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Transaction.find().populate(
      "senderWalletId receiverWalletId initiatedBy processedBy"
    ),
    query
  );
  const transactionsData = queryBuilder
    .filter()
    .search(transactionSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transactionsData.build(),
    queryBuilder.getMeta(),
  ]);
  return { data, meta };
};
const getTransaction = async (transactionId: string, userId: string) => {
  const userWallet = await Wallet.findOne({ userId });

  if (!userWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  const transaction = await Transaction.findOne({
    transactionId,
    $or: [
      { senderWalletId: userWallet._id },
      { receiverWalletId: userWallet._id },
    ],
  }).populate("senderWalletId receiverWalletId initiatedBy processedBy");

  if (!transaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
  }
  return transaction;
};

const getAgentCommission = async (
  agentId: string,
  query: Record<string, string>
) => {
  const queryBuilder = new QueryBuilder(
    Transaction.find({
      processedBy: agentId,
      type: { $in: [TransactionType.CASH_IN, TransactionType.CASH_OUT] },
    }).populate("senderWalletId receiverWalletId initiatedBy"),
    query
  );

  const transactionData = queryBuilder
    .filter()
    .search(transactionSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transactionData.build(),
    queryBuilder.getMeta(),
  ]);

  //   calculate total commission
  const totalCommission = data.reduce((sum, transaction) => {
    return sum + transaction.amount * 0.005;
  }, 0);
  return { data, meta, totalCommission };
};

export const TransactionServices = {
  getTransactions,
  getAllTransactions,
  getTransaction,
  getAgentCommission,
};
