import express from 'express';
import dotenv from 'dotenv';
import process from 'process';
import { connectionDB } from './config/database.js';

dotenv.config(); 

const PORT = process.env.PORT || 8088;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Test route
app.post('/', (req, res) => {
  const data = req.body;
  res.send(`Hello ${data.name}!`);
});

// Connect to DB then start server
connectionDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});