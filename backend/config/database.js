import mongoose from "mongoose";
import process from "process";
export const connectionDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connect to database successfully!");
  } catch (error) {
    console.log("connection failed to database: ", error.message);
  }
};
