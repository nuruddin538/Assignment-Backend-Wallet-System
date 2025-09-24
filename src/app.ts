import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport";
import { envVars } from "./app/config/env";

const app = express();

app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// Cookie-parser
app.use(cookieParser());

// Body parsing middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? [""] : ["http://localhost:5000"],
    credentials: true,
  })
);

// API routes
app.use("/api/v1", router);

app.get("/", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: "Welcome to Tour Management System Backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
