import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
import { VoteModel } from "../../models/vote.model";

describe("VoteController", () => {
  let mongoServer: MongoMemoryServer;
  let userToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const userId = new mongoose.Types.ObjectId();
    const adminId = new mongoose.Types.ObjectId();

    userToken = jwt.sign(
      { userId, email: "user@test.com", role: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { userId: adminId, email: "admin@test.com", role: "admin" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
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
      const userId = new mongoose.Types.ObjectId();
      await VoteModel.create({
        userId,
        name: "Test Vote",
        createdAt: new Date(),
      });

      const userToken = jwt.sign(
        { userId, email: "user@test.com", role: "user" },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

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
});
