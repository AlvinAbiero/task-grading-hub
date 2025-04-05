import mongoose from "mongoose";
import { config } from "./config";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("Connected to MOngoDB");
  } catch (error) {
    console.error("MongoDb connection error:", error);
    process.exit(1);
  }
};
