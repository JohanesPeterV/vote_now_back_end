import { VoteRepository, VoteCount } from "../repositories/vote.repository";
import { Vote } from "../models/vote.model";
import mongoose from "mongoose";

export class VoteService {
  private voteRepository: VoteRepository;

  constructor() {
    this.voteRepository = new VoteRepository();
  }

  async castVote(userId: string, name: string): Promise<Vote> {
    const existingVote = await this.voteRepository.findByUserId(userId);
    if (existingVote) {
      throw new Error("User has already voted");
    }

    return this.voteRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      name,
      createdAt: new Date(),
    });
  }

  async getVotes(): Promise<Vote[]> {
    return this.voteRepository.findAll();
  }

  async getUserVote(userId: string): Promise<Vote | null> {
    return this.voteRepository.findByUserId(userId);
  }

  async getDetailedVotes(): Promise<Vote[]> {
    return this.voteRepository.findAllDetailed();
  }

  async getVoteResults(): Promise<VoteCount[]> {
    return this.voteRepository.aggregateVotesByName();
  }
}
