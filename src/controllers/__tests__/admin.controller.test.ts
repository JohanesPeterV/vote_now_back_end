import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { VoteModel } from "../../models/vote.model";
import { UserModel } from "../../models/user.model";
import jwt from "jsonwebtoken";

describe("AdminController", () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/test"
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await VoteModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  describe("GET /api/admin/votes", () => {
    it("should return all votes when authenticated as admin", async () => {
      // Create admin user
      const adminUser = await UserModel.create({
        email: "admin@example.com",
        password: "Password123",
        role: "admin",
      });

      // Create test votes
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      await VoteModel.create([
        {
          userId: userId1,
          name: "Candidate A",
          createdAt: new Date("2024-01-01"),
        },
        {
          userId: userId2,
          name: "Candidate B",
          createdAt: new Date("2024-01-02"),
        },
      ]);

      // Create admin JWT token
      const token = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || "test_secret",
        { expiresIn: "1h" }
      );

      const response = await request(app)
        .get("/api/admin/votes")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("userId");
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("createdAt");
      expect(response.body[0].name).toBe("Candidate B"); // Most recent first
      expect(response.body[1].name).toBe("Candidate A"); // Older second
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(app).get("/api/admin/votes");
      expect(response.status).toBe(401);
    });

    it("should return 403 when authenticated as non-admin", async () => {
      // Create regular user
      const regularUser = await UserModel.create({
        email: "user@example.com",
        password: "Password123",
        role: "user",
      });

      // Create user JWT token
      const token = jwt.sign(
        {
          userId: regularUser._id,
          email: regularUser.email,
          role: regularUser.role,
        },
        process.env.JWT_SECRET || "test_secret",
        { expiresIn: "1h" }
      );

      const response = await request(app)
        .get("/api/admin/votes")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});
