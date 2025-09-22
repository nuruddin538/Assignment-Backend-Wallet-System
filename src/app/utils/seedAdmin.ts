import bcryptjs from "bcryptjs";
import { envVars } from "../config/env";
import { IAuthProvider, IUser, UserRole } from "../modules/user/user.interface";
import { UserModel } from "../modules/user/user.model";

export const seedAdmin = async () => {
  try {
    const isAdminExist = await UserModel.findOne({
      email: envVars.ADMIN_EMAIL,
    });

    if (isAdminExist) {
      console.log("Super Admin Already Exists");
      return;
    }
    console.log("Trying to create Admin...");
    const hashedPassword = await bcryptjs.hash(
      envVars.ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.ADMIN_EMAIL,
    };
    const payload: IUser = {
      name: "ADMIN",
      role: UserRole.ADMIN,
      email: envVars.ADMIN_EMAIL,
      password: hashedPassword,
      isEmailVerified: true,
      auths: [authProvider],
    };
    const admin = await UserModel.create(payload);
    console.log("Admin Created Successfully!");
    console.log(admin);
  } catch (error) {
    console.log(error);
  }
};
