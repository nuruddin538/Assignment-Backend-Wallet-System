/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, UserRole } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    phone: { type: String, unique: true, sparse: true },
    picture: { type: String },
    address: { type: String },
    nid: { type: String, unique: true, sparse: true },
    dateOfBirth: { type: Date },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    auths: [authProviderSchema],
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    commissionRate: { type: Number, default: 0.5 },
    totalCommission: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<IUser>("User", userSchema);
