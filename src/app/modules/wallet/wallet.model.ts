import { model, Schema } from "mongoose";
import {
  IWallet,
  IWalletMethods,
  WalletModel,
  WalletStatus,
} from "./wallet.interface";
import bcrypt from "bcryptjs";
import { generateWalletId } from "../../utils/helpers";

const walletSchema = new Schema<IWallet, WalletModel, IWalletMethods>(
  {
    walletId: {
      type: String,
      required: true,
      unique: true,
      default: generateWalletId,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.ACTIVE,
    },
    pin: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 4,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash pin before saving
walletSchema.pre("save", async function (next) {
  if (!this.isModified("pin")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    next(error as Error);
  }
});

// Compare pin method
walletSchema.methods.comparePin = async function (
  candidatePin: string
): Promise<boolean> {
  return bcrypt.compare(candidatePin, this.pin);
};

export const Wallet = model<IWallet, WalletModel>("Wallet", walletSchema);
