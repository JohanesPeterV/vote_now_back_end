import mongoose from "mongoose";

export const connectDB = async (uri: string) => {
  try {
    await mongoose.disconnect(); // Ensure no existing connections
    await mongoose.connect(uri);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.dropDatabase(); // Clean up test database
    await mongoose.disconnect();
  } catch (error) {
    console.error("MongoDB disconnect error:", error);
    throw error;
  }
};
