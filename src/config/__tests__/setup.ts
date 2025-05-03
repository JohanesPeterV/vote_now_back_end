import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

process.env.DB_URI =
  process.env.DB_URI || "mongodb://localhost:27017/vote-now-test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
