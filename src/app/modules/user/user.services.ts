import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive, IUser } from "./user.interface";
import { UserModel } from "./user.model";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  const isUserExist = await UserModel.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await UserModel.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });
  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.UserRole === "USER" || decodedToken.UserRole === "AGENT") {
    if (userId !== decodedToken.userId) {
      throw new AppError(401, "You are not authorized");
    }
  }

  const ifUserExist = await UserModel.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (ifUserExist.isDeleted || ifUserExist.isActive === IsActive.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This User can not be updated");
  }

  // ADMIN cannot modify a SUPER_ADMIN
  if (decodedToken.role === "ADMIN" && ifUserExist.role === "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  if (payload.role) {
    if (decodedToken.role === "USER" || decodedToken.role === "AGENT") {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  // Prevent USER -> SUPER_ADMIN or ADMIN -> SUPER_ADMIN
  if (
    payload.role === "SUPER_ADMIN" &&
    (ifUserExist.role === "USER" || ifUserExist.role === "ADMIN")
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Role cannot be updated to SUPER_ADMIN"
    );
  }
  // Status fields update restrictions
  if (
    payload.isActive ||
    payload.isDeleted ||
    payload.isEmailVerified ||
    payload.isPhoneVerified ||
    payload.approvalStatus
  ) {
    if (decodedToken.role === "USER" || decodedToken.role === "AGENT") {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }
  // Password hashing if bering updated
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND
    );
  }
  const newUpdatedUser = await UserModel.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  return newUpdatedUser;
};

const getAllUsers = async () => {
  const users = await UserModel.find({});
  const totalUsers = await UserModel.countDocuments();

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

const getSingleUser = async (id: string) => {
  const user = await UserModel.findById(id).select("-password");
  return user;
};

const getMe = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-password");
  return user;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
  getSingleUser,
  getMe,
};
