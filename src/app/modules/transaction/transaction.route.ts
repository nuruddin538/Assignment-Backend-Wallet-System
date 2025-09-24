import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { TransactionControllers } from "./transaction.controller";
import { getTransactionsZodSchema } from "./transaction.validation";

const router = Router();

router.get(
  "/",
  validateRequest(getTransactionsZodSchema),
  checkAuth(UserRole.USER, UserRole.AGENT),
  TransactionControllers.getTransactions
);

router.get(
  "/all",
  validateRequest(getTransactionsZodSchema),
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  TransactionControllers.getAllTransactions
);

router.get(
  "/:transactionId",
  checkAuth(
    UserRole.USER,
    UserRole.AGENT,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  TransactionControllers.getTransaction
);

router.get(
  "/agent/commission",
  validateRequest(getTransactionsZodSchema),
  checkAuth(UserRole.AGENT),
  TransactionControllers.getAgentCommission
);

export const TransactionRoutes = router;
