import mongoose from "mongoose";
import { VoteRepository } from "../vote.repository";
import { VoteModel } from "../../models/vote.model";
import { setupTestDB } from "../../config/__tests__/setup";

describe("VoteRepository", () => {
  let voteRepository: VoteRepository;

  setupTestDB();

  beforeAll(() => {
    voteRepository = new VoteRepository();
  });

  describe("create", () => {
    it("should create a new vote", async () => {
      const voteData = {
        userId: new mongoose.Types.ObjectId(),
        name: "Test Vote",
        createdAt: new Date(),
      };

      const vote = await voteRepository.create(voteData);

      expect(vote).toBeDefined();
      expect(vote.userId).toEqual(voteData.userId);
      expect(vote.name).toBe(voteData.name);
      expect(vote.createdAt).toBeDefined();
    });
  });

  describe("findByUserId", () => {
    it("should find a vote by userId", async () => {
      const userId = new mongoose.Types.ObjectId();
      const voteData = {
        userId,
        name: "Test Vote",
        createdAt: new Date(),
      };

      await VoteModel.create(voteData);
      const foundVote = await voteRepository.findByUserId(userId.toString());

      expect(foundVote).toBeDefined();
      expect(foundVote?.userId).toEqual(userId);
      expect(foundVote?.name).toBe(voteData.name);
    });

    it("should return null if vote not found", async () => {
      const foundVote = await voteRepository.findByUserId(
        new mongoose.Types.ObjectId().toString()
      );
      expect(foundVote).toBeNull();
    });
  });

  describe("findAll", () => {
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
      const foundVotes = await voteRepository.findAll();

      expect(foundVotes).toHaveLength(2);
      expect(foundVotes[0].name).toBe("Vote 1");
      expect(foundVotes[1].name).toBe("Vote 2");
    });

    it("should return empty array if no votes exist", async () => {
      const foundVotes = await voteRepository.findAll();
      expect(foundVotes).toHaveLength(0);
    });
  });

  describe("findAllDetailed", () => {
    it("should return all votes with userId, name, and createdAt fields", async () => {
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

      const votes = await voteRepository.findAllDetailed();

      expect(votes).toHaveLength(2);
      expect(votes[0]).toHaveProperty("userId");
      expect(votes[0]).toHaveProperty("name");
      expect(votes[0]).toHaveProperty("createdAt");
    });

    it("should return votes sorted by createdAt in descending order", async () => {
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

      const votes = await voteRepository.findAllDetailed();

      expect(votes).toHaveLength(2);
      expect(votes[0].name).toBe("Candidate B");
      expect(votes[1].name).toBe("Candidate A");
    });

    it("should return empty array when no votes exist", async () => {
      const votes = await voteRepository.findAllDetailed();
      expect(votes).toHaveLength(0);
    });
  });

  describe("aggregateVotesByName", () => {
    it("should aggregate votes by name and return counts", async () => {
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

      const results = await voteRepository.aggregateVotesByName();

      expect(results).toHaveLength(2);
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Candidate A", count: 2 }),
          expect.objectContaining({ name: "Candidate B", count: 1 }),
        ])
      );
    });

    it("should return empty array when no votes exist", async () => {
      const results = await voteRepository.aggregateVotesByName();
      expect(results).toHaveLength(0);
    });

    it("should sort results by count in descending order", async () => {
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
          name: "Candidate B",
          createdAt: new Date(),
        },
      ]);

      const results = await voteRepository.aggregateVotesByName();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe("Candidate B");
      expect(results[0].count).toBe(2);
      expect(results[1].name).toBe("Candidate A");
      expect(results[1].count).toBe(1);
    });
  });
});
