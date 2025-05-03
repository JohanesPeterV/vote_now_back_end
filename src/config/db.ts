import mongoose from "mongoose";

export const connectDB = async (uri: string) => {
  try {
    await mongoose.disconnect();
    await mongoose.connect(uri);
  } catch (error) {
    console.error("DB connection error:", error);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error("DB disconnect error:", error);
    throw error;
  }
};
