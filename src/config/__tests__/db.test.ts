import mongoose from "mongoose";
import { connectDB } from "../db";

describe("MongoDB Connection", () => {
  const testUri = process.env.MONGODB_TEST_URI;

  if (!testUri) {
    throw new Error("MONGODB_TEST_URI environment variable is not set");
  }

  it("should be able to connect to database", async () => {
    await connectDB(testUri);
    expect(mongoose.connection.readyState).toBe(
      mongoose.ConnectionStates.connected
    );
  });
});
