import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
import { VoteModel } from "../../models/vote.model";
import { UserModel } from "../../models/user.model";
import { setupTestDB } from "../../config/__tests__/setup";

describe("VoteController", () => {
  let userToken: string;
  let userId: string;

  setupTestDB();

  beforeEach(async () => {
    await VoteModel.deleteMany({});
    await UserModel.deleteMany({});

    const user = await UserModel.create({
      email: "test@example.com",
      password: "Password123",
      role: "user",
    });
    userId = user._id.toString();

    userToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "test_secret",
      { expiresIn: "1h" }
    );
  });

  describe("POST /api/votes", () => {
    it("should create a new vote", async () => {
      const response = await request(app)
        .post("/api/votes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Test Vote" });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Vote cast successfully");
      expect(response.body.vote).toBeDefined();
      expect(response.body.vote.name).toBe("Test Vote");
    });

    it("should not allow duplicate votes", async () => {
      await request(app)
        .post("/api/votes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Test Vote" });

      const response = await request(app)
        .post("/api/votes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Test Vote" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User has already voted");
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/votes")
        .send({ name: "Test Vote" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });

    it("should require name in request body", async () => {
      const response = await request(app)
        .post("/api/votes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Name is required");
    });
  });

  describe("GET /api/votes", () => {
    it("should return all votes", async () => {
      await VoteModel.insertMany([
        {
          userId: new mongoose.Types.ObjectId(),
          name: "Vote 1",
          createdAt: new Date(),
        },
        {
          userId: new mongoose.Types.ObjectId(),
          name: "Vote 2",
          createdAt: new Date(),
        },
      ]);

      const response = await request(app).get("/api/votes");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe("Vote 1");
      expect(response.body[1].name).toBe("Vote 2");
    });
  });

  describe("GET /api/votes/my-vote", () => {
    it("should return user's vote", async () => {
      await VoteModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        name: "Test Vote",
        createdAt: new Date(),
      });

      const response = await request(app)
        .get("/api/votes/my-vote")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.name).toBe("Test Vote");
    });

    it("should return null if user hasn't voted", async () => {
      const response = await request(app)
        .get("/api/votes/my-vote")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/votes/my-vote");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /api/votes/result", () => {
    it("should return aggregated vote results", async () => {
      await VoteModel.create([
        {
          userId: new mongoose.Types.ObjectId(),
          name: "Candidate A",
          createdAt: new Date(),
        },
        {
          userId: new mongoose.Types.ObjectId(),
          name: "Candidate B",
          createdAt: new Date(),
        },
        {
          userId: new mongoose.Types.ObjectId(),
          name: "Candidate A",
          createdAt: new Date(),
        },
      ]);

      const response = await request(app).get("/api/votes/result");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Candidate A", count: 2 }),
          expect.objectContaining({ name: "Candidate B", count: 1 }),
        ])
      );
    });

    it("should return empty array when no votes exist", async () => {
      const response = await request(app).get("/api/votes/result");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it("should handle database errors gracefully", async () => {
      jest.spyOn(VoteModel, "aggregate").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app).get("/api/votes/result");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "message",
        "Error fetching vote results"
      );
    });
  });

  describe("GET /api/votes/names", () => {
    it("should return unique vote names", async () => {
      const votes = [
        { userId: new mongoose.Types.ObjectId(), name: "Option 1" },
        { userId: new mongoose.Types.ObjectId(), name: "Option 2" },
        { userId: new mongoose.Types.ObjectId(), name: "Option 1" },
      ];

      await VoteModel.insertMany(votes);

      const res = await request(app).get("/api/votes/names");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body).toContain("Option 1");
      expect(res.body).toContain("Option 2");
    });
  });
});
