import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { connectDB } from "../../config/db";

describe("AuthController", () => {
  const testUri = process.env.MONGODB_TEST_URI;

  beforeAll(async () => {
    if (!testUri) {
      throw new Error("MONGODB_TEST_URI environment variable is not set");
    }
    await connectDB(testUri);
  });

  beforeEach(async () => {
    await mongoose.connection.db!.dropDatabase();
  });

  describe("POST /api/auth/register", () => {
    const validUserData = {
      email: "test22@example.com",
      password: "Password123",
    };

    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User registered successfully");
    });

    it("register should check if user with email already exists", async () => {
      await request(app).post("/api/auth/register").send(validUserData);

      const response = await request(app)
        .post("/api/auth/register")
        .send(validUserData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });

    it("should validate email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ ...validUserData, email: "invalid-email" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
    });

    it("should validate password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ ...validUserData, password: "weak" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
    });
  });
});
