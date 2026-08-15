import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDB from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server for handling uncaught exception");
  process.exit(1);
});

// database connection with upload folder creation
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
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
  } catch (error) {
    console.log("Database connection failed:", error.message);
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
