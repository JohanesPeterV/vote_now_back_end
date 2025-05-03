import request from "supertest";
import app from "../../app";
import { connectDB, disconnectDB } from "../../config/db";

describe("AuthController", () => {
  const testUri = process.env.DB_URI;

  beforeAll(async () => {
    if (!testUri) {
      throw new Error("DB_URI environment variable is not set");
    }
    await connectDB(testUri);
  });
  afterAll(async () => {
    await disconnectDB();
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

    it("should check if user with email already registered", async () => {
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

  describe("POST /api/auth/login", () => {
    const validUserData = {
      email: "testlogin@example.com",
      password: "Password123",
    };

    beforeAll(async () => {
      await request(app).post("/api/auth/register").send(validUserData);
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send(validUserData);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe("string");
    });

    it("should reject login with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ ...validUserData, password: "WrongPassword" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should reject login if user not found", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "notfound@example.com", password: "Whatever123" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });
});
