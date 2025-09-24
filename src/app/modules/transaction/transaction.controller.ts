/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { TransactionServices } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";

const getTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as JwtPayload).userId;
    const query = req.query;

    const result = await TransactionServices.getTransactions(
      userId,
      query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Transactions retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;

    const result = await TransactionServices.getAllTransactions(
      query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All transactions retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getTransaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;
    const userId = (req.user as JwtPayload).userId;

    const result = await TransactionServices.getTransaction(
      transactionId,
      userId
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Transaction retrieved successfully",
      data: result,
    });
  }
);

const getAgentCommission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = (req.user as JwtPayload).userId;
    const query = req.query;

    const result = await TransactionServices.getAgentCommission(
      agentId,
      query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Commission data retrieved successfully",
      data: result.data,
      meta: {
        total: result.meta.total,
        totalCommission: result.totalCommission,
      },
    });
  }
);

export const TransactionControllers = {
  getTransactions,
  getAllTransactions,
  getTransaction,
  getAgentCommission,
};
