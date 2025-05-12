import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToDb = async () => {
  const url = process.env.MONGODB_URL;
  if (!url) {
    throw new Error("No database url provided");
  }
  await mongoose.connect(url);
  console.log("db connected");
};

export default connectToDb;