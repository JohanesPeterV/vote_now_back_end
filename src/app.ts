import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

if (!process.env.DB_URI) {
  throw new Error("DB_URI environment variable is not defined");
}

connectDB(process.env.DB_URI).then(() => {
  console.log("Connected to Database");
});

const defaultPort = 4000;
if (require.main === module) {
  const PORT = process.env.PORT || defaultPort;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
