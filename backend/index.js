import express from 'express';
import dotenv from 'dotenv';
import process from 'process';
import cors from 'cors';
import { connectionDB } from './config/database.js';
import authRouter from './routes/auth.routes.js'
import authMiddleware from './middleware/auth.middleware.js';

dotenv.config(); 

const PORT = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// cors
app.use(cors());

// Middleware for routes
app.use("/api/auth",authRouter)
console.log("Auth routes registered at /api/auth");

app.use(authMiddleware);

// Connect to DB then start server
connectionDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});