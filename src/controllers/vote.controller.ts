import { RequestHandler, Request } from "express";
import { VoteService } from "../services/vote.service";

const voteService = new VoteService();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const castVote: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    try {
      const vote = await voteService.castVote(userId, name);
      res.status(201).json({ message: "Vote cast successfully", vote });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "User has already voted"
      ) {
        res.status(400).json({ message: error.message });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({ message: "Error casting vote" });
  }
};

export const getVotes: RequestHandler = async (_req, res) => {
  try {
    const votes = await voteService.getVotes();
    res.status(200).json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ message: "Error fetching votes" });
  }
};

export const getUserVote: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const vote = await voteService.getUserVote(userId);
    res.status(200).json(vote);
  } catch (error) {
    console.error("Error fetching user vote:", error);
    res.status(500).json({ message: "Error fetching user vote" });
  }
};

export const getVoteResults: RequestHandler = async (_req, res) => {
  try {
    const results = await voteService.getVoteResults();
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching vote results:", error);
    res.status(500).json({ message: "Error fetching vote results" });
  }
};

export const getUniqueVoteNames: RequestHandler = async (_req, res) => {
  try {
    const names = await voteService.getUniqueVoteNames();
    res.status(200).json(names);
  } catch (error) {
    console.error("Error fetching unique vote names:", error);
    res.status(500).json({ message: "Error fetching unique vote names" });
  }
};
