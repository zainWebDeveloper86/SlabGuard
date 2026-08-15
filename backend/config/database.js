import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const res = await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB connected: ${res.connection.host}`);
  } catch (error) {
    console.log(`Database connection failed: ${error.message}`);
    throw error; // rethrow so index.js's catch actually fires
  }
};

export default connectDB;
