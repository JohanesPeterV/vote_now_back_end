import mongoose from "mongoose";

export const connectDB = async (uri: string) => {
  await mongoose.connect(uri);
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
};
