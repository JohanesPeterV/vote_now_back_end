import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";

describe("AuthController", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
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

    beforeEach(async () => {
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
