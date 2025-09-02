import express, { Request, Response } from "express";
const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Tour Management System Backend",
  });
});

export default app;
