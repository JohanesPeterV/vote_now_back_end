import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { VoteRepository } from "../vote.repository";
import { VoteModel } from "../../models/vote.model";

describe("VoteRepository", () => {
  let mongoServer: MongoMemoryServer;
  let voteRepository: VoteRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    voteRepository = new VoteRepository();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
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
});
