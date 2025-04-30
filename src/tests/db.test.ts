import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";

describe("MongoDB Connection", () => {
  const testUri =
    process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/vote-now-test";

  beforeAll(async () => {
    await connectDB(testUri);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("should be able to connect to MongoDB", () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});
