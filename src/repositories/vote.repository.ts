import { Vote, VoteModel } from "../models/vote.model";
import mongoose from "mongoose";

export interface VoteCount {
  name: string;
  count: number;
}

export class VoteRepository {
  async create(vote: {
    userId: mongoose.Types.ObjectId;
    name: string;
    createdAt: Date;
  }): Promise<Vote> {
    return VoteModel.create(vote);
  }

  async findByUserId(userId: string): Promise<Vote | null> {
    return VoteModel.findOne({ userId });
  }

  async findAll(): Promise<Vote[]> {
    return VoteModel.find();
  }

  async findAllDetailed(): Promise<Vote[]> {
    return VoteModel.find()
      .select("userId name createdAt")
      .populate("userId", "email")
      .sort({ createdAt: -1 });
  }

  async aggregateVotesByName(): Promise<VoteCount[]> {
    const results = await VoteModel.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return results.length > 0 ? results : [];
  }

  async getUniqueVoteNames(): Promise<string[]> {
    const results = await VoteModel.distinct("name");
    return results;
  }
}
