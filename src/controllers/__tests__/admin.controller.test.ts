import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { VoteModel } from "../../models/vote.model";
import { setupTestDB } from "../../config/__tests__/setup";
import jwt from "jsonwebtoken";

describe("Admin Controller", () => {
  setupTestDB();

  let adminToken: string;

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await VoteModel.deleteMany({});

    const admin = await UserModel.create({
      email: "admin@example.com",
      password: "Password123!",
      role: "admin",
    });

    adminToken = jwt.sign(
      { userId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
  });

  describe("GET /api/admin/users", () => {
    it("should return all users", async () => {
      const users = [
        {
          email: "user1@example.com",
          password: "Password123!",
          role: "user",
        },
        {
          email: "user2@example.com",
          password: "Password123!",
          role: "user",
        },
      ];

      await UserModel.insertMany(users);

      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
      expect(res.body[1]).toHaveProperty("email", users[0].email);
      expect(res.body[2]).toHaveProperty("email", users[1].email);
    });

    it("should return empty array when no users exist", async () => {
      await UserModel.deleteMany({});

      const admin = await UserModel.create({
        email: "admin@example.com",
        password: "Password123!",
        role: "admin",
      });

      const token = jwt.sign(
        { userId: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe("GET /api/admin/votes", () => {
    it("should return all votes", async () => {
      const user1 = await UserModel.create({
        email: "user1@example.com",
        password: "Password123!",
        role: "user",
      });

      const user2 = await UserModel.create({
        email: "user2@example.com",
        password: "Password123!",
        role: "user",
      });

      const votes = [
        {
          userId: user1._id,
          name: "Vote 1",
        },
        {
          userId: user2._id,
          name: "Vote 2",
        },
      ];

      await VoteModel.insertMany(votes);

      const res = await request(app)
        .get("/api/admin/votes")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("name", votes[0].name);
      expect(res.body[1]).toHaveProperty("name", votes[1].name);
    });

    it("should return empty array when no votes exist", async () => {
      const res = await request(app)
        .get("/api/admin/votes")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });
});
