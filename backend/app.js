import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import applianceProfileRouter from "./routes/applianceProfile.routes.js";
import billingRouter from "./routes/billHistory.routes.js";
import tariffRouter from "./routes/tariff.routes.js";
import predictionRouter from "./routes/prediction.routes.js";
import usageRouter from "./routes/dailyUsage.routes.js";
import adminRouter from "./routes/admin.routes.js";
import alertRouter from "./routes/alert.routes.js";
import broadcastRouter from "./routes/broadcast.routes.js";
import supportTicketRouter from "./routes/supportTicket.routes.js";
import weatherRouter from "./routes/weather.routes.js";

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
app.use("/api/appliance-profile", applianceProfileRouter);
app.use("/api/billing", billingRouter);
app.use("/api/tariff", tariffRouter);
app.use("/api/prediction", predictionRouter);
app.use("/api/usage", usageRouter);
app.use("/api/admin", adminRouter);
app.use("/api/alerts", alertRouter);
app.use("/api/broadcast", broadcastRouter);
app.use("/api/support-tickets", supportTicketRouter);
app.use("/api/weather", weatherRouter);

// handling middlewares
app.use(errorMiddleware);

export default app;
