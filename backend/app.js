import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// cors
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// img/file storage
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/user", userRouter);

// handling middlewares
app.use(errorMiddleware);

export default app;
