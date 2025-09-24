import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createWalletZodSchema,
  transferZodSchema,
  walletActionZodSchema,
} from "./wallet.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";
import { updateUserZodSchema } from "../user/user.validation";

const router = Router();

router.post(
  "/wallet",
  validateRequest(createWalletZodSchema),
  checkAuth(UserRole.USER, UserRole.AGENT),
  WalletControllers.createWallet
);

router.get(
  "/",
  checkAuth(UserRole.USER, UserRole.AGENT),
  checkAuth(
    UserRole.USER,
    UserRole.AGENT,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  WalletControllers.getWallet
);

router.patch(
  "/:walletId/status",
  validateRequest(updateUserZodSchema),
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  WalletControllers.updateWalletStatus
);

router.post(
  "/add-money",
  validateRequest(walletActionZodSchema),
  checkAuth(UserRole.USER),
  WalletControllers.addMoney
);

router.post(
  "/transfer",
  validateRequest(transferZodSchema),
  checkAuth(UserRole.USER),
  WalletControllers.transferMoney
);

router.post(
  "/cash-in",
  validateRequest(walletActionZodSchema),
  checkAuth(UserRole.AGENT),
  WalletControllers.cashIn
);

export const WalletRoutes = router;
