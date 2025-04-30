import mongoose from "mongoose";
import { AuthService } from "../auth.service";
import { connectDB } from "../../config/db";

describe("AuthService", () => {
  const testUri = process.env.MONGODB_TEST_URI;
  let authService: AuthService;

  beforeAll(async () => {
    if (!testUri) {
      throw new Error("MONGODB_TEST_URI environment variable is not set");
    }
    await connectDB(testUri);
    authService = new AuthService();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  describe("register", () => {
    const validUserData = {
      email: "register-test@example.com",
      password: "Password123",
    };

    it("should register a new user", async () => {
      const user = await authService.register(validUserData);
      expect(user.email).toBe(validUserData.email);
      expect(user.role).toBe("user");
      expect(user.password).not.toBe(validUserData.password); // Password should be hashed
    });

    it("should not register a user with existing email", async () => {
      await authService.register(validUserData);
      await expect(authService.register(validUserData)).rejects.toThrow(
        "User already exists"
      );
    });
  });
});
