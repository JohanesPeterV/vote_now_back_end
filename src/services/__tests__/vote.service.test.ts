import mongoose from "mongoose";
import { VoteService } from "../vote.service";
import { VoteModel } from "../../models/vote.model";
import { setupTestDB } from "../../config/__tests__/setup";

describe("VoteService", () => {
  let voteService: VoteService;

  setupTestDB();

  beforeAll(() => {
    voteService = new VoteService();
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
      expect(votes[0].name).toBe("Candidate B");
      expect(votes[1].name).toBe("Candidate A");
    });

    it("should return empty array when no votes exist", async () => {
      const votes = await voteService.getDetailedVotes();
      expect(votes).toHaveLength(0);
    });
  });

  describe("getVoteResults", () => {
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

      const results = await voteService.getVoteResults();

      expect(results).toHaveLength(2);
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Candidate A", count: 2 }),
          expect.objectContaining({ name: "Candidate B", count: 1 }),
        ])
      );
    });

    it("should return empty array when no votes exist", async () => {
      const results = await voteService.getVoteResults();
      expect(results).toHaveLength(0);
    });
  });
});
