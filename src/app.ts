import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

const app = express();

// CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json());

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
