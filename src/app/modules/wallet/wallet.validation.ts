import z from "zod";
import { WalletStatus } from "./wallet.interface";

export const createWalletZodSchema = z.object({
  pin: z
    .string({ message: "PIN must be string" })
    .length(4, { message: "PIN must be exactly 4 digits" })
    .regex(/^\d+$/, { message: "PIN must contain only digits" }),
});

export const updateWalletZodSchema = z.object({
  status: z.enum(Object.values(WalletStatus) as [string]).optional(),
});

export const walletActionZodSchema = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .min(1, { message: "Amount must be at least 1" }),
  pin: z
    .string({ message: "PIN must be string" })
    .length(4, { message: "PIN must be exactly 4 digits" }),
});

export const transferZodSchema = z.object({
  receiverWalletId: z
    .string({ message: "Receiver wallet ID must be string" })
    .min(1, { message: "Receiver wallet ID is required" }),
  amount: z
    .number({ message: "Amount must be a number" })
    .min(1, { message: "Amount must be at least 1" }),
  pin: z
    .string({ message: "PIN must be string" })
    .length(4, { message: "PIN must be exactly 4 digits" }),
  description: z
    .string({ message: "Description must be string" })
    .max(225, { message: "Description cannot exceed 255 characters" })
    .optional(),
});
