import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import voteRoutes from "./routes/vote";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/error", (req, res, next) => {
  const error = new Error("Internal Server Error");
  next(error);
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

if (require.main === module) {
  if (!process.env.DB_URI) {
    throw new Error("DB_URI environment variable is not defined");
  }

  connectDB(process.env.DB_URI).then(() => {
    console.log("Connected to Database");
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

export default app;
