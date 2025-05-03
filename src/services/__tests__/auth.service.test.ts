import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AuthService } from "../auth.service";

describe("AuthService", () => {
  let mongoServer: MongoMemoryServer;
  let authService: AuthService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    authService = new AuthService();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("register", () => {
    const validUserData = {
      email: "register-test@example.com",
      password: "Password123",
    };

    it("should register a new user and hash password", async () => {
      const user = await authService.register(validUserData);
      expect(user.email).toBe(validUserData.email);
      expect(user.role).toBe("user");
      expect(user.password).not.toBe(validUserData.password);
    });

    it("should not register a user with existing email", async () => {
      await authService.register(validUserData);
      await expect(authService.register(validUserData)).rejects.toThrow(
        "User already exists"
      );
    });
  });

  describe("login", () => {
    const validUserData = {
      email: "login-test@example.com",
      password: "Password123",
    };

    beforeEach(async () => {
      await authService.register(validUserData);
    });

    it("should login successfully with correct credentials", async () => {
      const result = await authService.login(validUserData);

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
    });

    it("should throw error with incorrect password", async () => {
      await expect(
        authService.login({ ...validUserData, password: "WrongPassword" })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error if user does not exist", async () => {
      await expect(
        authService.login({
          email: "notfound@example.com",
          password: "Whatever123",
        })
      ).rejects.toThrow("Invalid credentials");
    });
  });
});
