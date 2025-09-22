/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";
import { UserModel } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";
import { IsActive } from "../modules/user/user.interface";
import httpStatus from "http-status-codes";

export const checkAuth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;

      if (!accessToken) {
        throw new AppError(401, "You are not authorized");
      }
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET as string
      ) as any;

      const isUserExist = await UserModel.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }
      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`
        );
      }
      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      const user = await UserModel.findById(verifiedToken.userId);
      if (!user) {
        throw new AppError(401, "User not found");
      }
      if (user.isDeleted) {
        throw new AppError(401, "User is deleted");
      }
      if (user.isActive !== "ACTIVE") {
        throw new AppError(401, "User is not active");
      }
      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new AppError(401, "You are not authorized");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      console.log("jwt error", error);
      next(error);
    }
  };
};
