import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { VoteService } from "../vote.service";
import { VoteModel } from "../../models/vote.model";

describe("VoteService", () => {
  let mongoServer: MongoMemoryServer;
  let voteService: VoteService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    voteService = new VoteService();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("castVote", () => {
    it("should create a new vote", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const name = "Test Vote";

      const vote = await voteService.castVote(userId, name);

      expect(vote).toBeDefined();
      expect(vote.userId.toString()).toBe(userId);
      expect(vote.name).toBe(name);
      expect(vote.createdAt).toBeDefined();
    });

    it("should throw error if user has already voted", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const name = "Test Vote";

      await voteService.castVote(userId, name);

      await expect(voteService.castVote(userId, name)).rejects.toThrow(
        "User has already voted"
      );
    });
  });

  describe("getVotes", () => {
    it("should return all votes", async () => {
      const votes = [
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
      ];

      await VoteModel.insertMany(votes);
      const foundVotes = await voteService.getVotes();

      expect(foundVotes).toHaveLength(2);
      expect(foundVotes[0].name).toBe("Vote 1");
      expect(foundVotes[1].name).toBe("Vote 2");
    });
  });

  describe("getUserVote", () => {
    it("should return user's vote", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const name = "Test Vote";

      await voteService.castVote(userId, name);
      const foundVote = await voteService.getUserVote(userId);

      expect(foundVote).toBeDefined();
      expect(foundVote?.userId.toString()).toBe(userId);
      expect(foundVote?.name).toBe(name);
    });

    it("should return null if user hasn't voted", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const foundVote = await voteService.getUserVote(userId);

      expect(foundVote).toBeNull();
    });
  });

  describe("getDetailedVotes", () => {
    it("should return all votes with detailed information", async () => {
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

      const votes = await voteService.getDetailedVotes();

      expect(votes).toHaveLength(2);
      expect(votes[0]).toHaveProperty("userId");
      expect(votes[0]).toHaveProperty("name");
      expect(votes[0]).toHaveProperty("createdAt");
      expect(votes[0].name).toBe("Candidate B"); // Most recent first
      expect(votes[1].name).toBe("Candidate A"); // Older second
    });

    it("should return empty array when no votes exist", async () => {
      const votes = await voteService.getDetailedVotes();
      expect(votes).toHaveLength(0);
    });
  });
});
