import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

process.env.MONGODB_TEST_URI =
  process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/vote-now-test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
