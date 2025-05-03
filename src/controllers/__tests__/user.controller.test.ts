import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { UserRepository } from "../../repositories/user.repository";

describe("UserController", () => {
  let mongoServer: MongoMemoryServer;
  let userRepository: UserRepository;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    userRepository = new UserRepository();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("GET /api/admin/users", () => {
    beforeEach(async () => {
      // Create test users and generate tokens
      const adminUser = await userRepository.create({
        email: "admin@test.com",
        password: "Password123",
        role: "admin" as const,
      });

      const normalUser = await userRepository.create({
        email: "user@test.com",
        password: "Password123",
        role: "user" as const,
      });

      adminToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      userToken = jwt.sign(
        {
          userId: normalUser._id,
          email: normalUser.email,
          role: normalUser.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );
    });

    it("should allow admin to get all users", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("email");
      expect(response.body[0]).toHaveProperty("role");
      expect(response.body[0]).not.toHaveProperty("password");
    });

    it("should not allow normal user to get all users", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Insufficient permissions");
    });

    it("should not allow access without token", async () => {
      const response = await request(app).get("/api/admin/users");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });

    it("should not allow access with invalid token", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", "Bearer invalid.token.here");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });
  });
});
