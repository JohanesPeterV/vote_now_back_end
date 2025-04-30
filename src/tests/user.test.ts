import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/user";

describe("User Model", () => {
  const testUri =
    process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/vote-now-test";

  beforeAll(async () => {
    await connectDB(testUri);
  });

  afterAll(async () => {
    await mongoose.connection.db!.dropDatabase();
    await disconnectDB();
  });

  it("should be able to insert a user to the database", async () => {
    const sample = {
      email: "test@example.com",
      password: "hashedpassword",
      role: "USER",
    };
    await User.create(sample);

    const found = await User.findOne({ email: sample.email });
    expect(found).not.toBeNull();
    expect(found!.email).toBe(sample.email);
    expect(found!.role).toBe(sample.role);
  });
});
