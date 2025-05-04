import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { setupTestDB } from "../../config/__tests__/setup";

describe("Auth Controller", () => {
  setupTestDB();

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    const validUser = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", validUser.email);
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should return 400 for invalid input", async () => {
      const invalidUser = {
        email: "invalid-email",
        password: "123",
        name: "",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should return 409 for duplicate email", async () => {
      await request(app).post("/api/auth/register").send(validUser);

      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("message", "Email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    const testUser = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login successfully with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", testUser.email);
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should return 401 for invalid password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should return 401 for non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: testUser.password,
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });
  });
});
