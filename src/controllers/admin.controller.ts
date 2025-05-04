import { RequestHandler } from "express";
import { VoteService } from "../services/vote.service";

const voteService = new VoteService();

export const getAllVotesDetailed: RequestHandler = async (_req, res) => {
  try {
    const votes = await voteService.getDetailedVotes();
    res.status(200).json(votes);
  } catch (error) {
    console.error("Error fetching detailed votes:", error);
    res.status(500).json({ message: "Error fetching detailed votes" });
  }
};
