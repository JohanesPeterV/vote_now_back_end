import { Vote, VoteModel } from "../models/vote.model";
import mongoose from "mongoose";

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
}
