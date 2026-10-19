import dotenv from "dotenv";
dotenv.config();

import { startNightlyAggregationJob } from "./jobs/nightlyAggregation.job.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDB from "./config/database.js";
import Tariff from "./models/tariff.model.js"
import { DEFAULT_TARIFF } from "./controllers/tariff.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server for handling uncaught exception");
  process.exit(1);
});

// Database connection ke baad
const seedTariff = async () => {
  const existing = await Tariff.findOne();
  if (!existing) {
    await Tariff.create(DEFAULT_TARIFF);
    console.log("✅ Tariff seeded successfully");
  }
};

// database connection with upload folder creation
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    await seedTariff(); // finish tariff initialization before accepting requests

    // Uploads folder create
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("📁 Uploads folder created");
    }

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    startNightlyAggregationJob();
  } catch (error) {
    console.log("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

// for online server, check backend works
// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Backend is running 🚀",
//   });
// });
