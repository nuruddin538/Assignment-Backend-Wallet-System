import z from "zod";
import { TransactionStatus, TransactionType } from "./transaction.interface";

export const getTransactionsZodSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    type: z.enum(Object.values(TransactionType) as [string]).optional(),
    status: z.enum(Object.values(TransactionStatus) as [string]).optional(),
    searchTerm: z.string().optional(),
  }),
});
