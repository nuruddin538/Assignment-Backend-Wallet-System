/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { WalletServices } from "./wallet.service";
import { sendResponse } from "../../utils/sendResponse";

const createWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as JwtPayload).userId;
    const { pin } = req.body;
    const wallet = await WalletServices.createWallet(userId, pin);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Wallet created successfully",
      data: wallet,
    });
  }
);

const getWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as JwtPayload).userId;

    const wallet = await WalletServices.getWallet(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Wallet retrieved successfully",
      data: wallet,
    });
  }
);

const updateWalletStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    const { status } = req.body;
    const adminId = (req.user as JwtPayload).userId;

    const wallet = await WalletServices.updateWalletStatus(
      walletId,
      status,
      adminId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Wallet status updated successfully",
      data: wallet,
    });
  }
);

const addMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as JwtPayload).userId;
    const { amount, pin } = req.body;

    const result = await WalletServices.addMoney(userId, amount, pin);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Money added successfully",
      data: result,
    });
  }
);

const transferMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as JwtPayload).userId;
    const { receiverWalletId, amount, pin, description } = req.body;

    const result = await WalletServices.transferMoney(
      userId,
      receiverWalletId,
      amount,
      pin,
      description
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Money transferred successfully",
      data: result,
    });
  }
);

const cashIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = (req.user as JwtPayload).userId;
    const { walletId, amount, pin } = req.body;

    const result = await WalletServices.cashIn(agentId, walletId, amount, pin);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Cash-in successful",
      data: result,
    });
  }
);

export const WalletControllers = {
  createWallet,
  getWallet,
  updateWalletStatus,
  addMoney,
  transferMoney,
  cashIn,
};
