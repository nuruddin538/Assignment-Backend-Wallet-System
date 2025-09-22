import bcryptjs from "bcryptjs";
/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { envVars } from "./env";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { UserModel } from "../modules/user/user.model";
import { UserRole } from "../modules/user/user.interface";
import { Strategy as localStorage } from "passport-local";

passport.use(
  new localStorage(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await UserModel.findOne({ email }).select(
          "+password"
        );

        if (!isUserExist) {
          return done(null, false, { message: "User Does not exist" });
        }

        const isGoogleAuthenticated = isUserExist.auths.some(
          (providerObjects) => providerObjects.provider === "google"
        );

        if (isGoogleAuthenticated && !isUserExist.password) {
          return done(null, false, {
            message:
              "You have authenticated through google. So if you want to login with credentials, then at first login with google and set a password for your Gamil and then you can login with email and password.",
          });
        }

        // if (isGoogleAuthenticated) {
        //   return done(
        //     "You have authenticated through google. So if you want to login with credentials, then at first login with google and set a password for your Gamil and then you can login with email and password."
        //   );
        // }

        if (!isUserExist.password) {
          return done(null, false, {
            message: "Password not set for this account",
          });
        }

        const isPasswordMatched = await bcryptjs.compare(
          password,
          isUserExist.password
        );
        if (!isPasswordMatched) {
          return done(null, false, { message: "Password does not match" });
        }
        return done(null, isUserExist);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, { message: "No email found" });
        }
        let user = await UserModel.findOne({ email });
        if (!user) {
          user = await UserModel.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: UserRole.USER,
            isEmailVerified: true,
            auth: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }
        return done(null, user);
      } catch (error) {
        console.log("Google Strategy Error", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
});
