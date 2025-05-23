import { Router } from "express";
import {
  castVote,
  getVotes,
  getUserVote,
  getVoteResults,
  getUniqueVoteNames,
} from "../controllers/vote.controller";
import { authenticateJWT } from "../middlewares/authenticate";

const router = Router();

router.post("/", authenticateJWT, castVote);
router.get("/", getVotes);
router.get("/my-vote", authenticateJWT, getUserVote);
router.get("/result", getVoteResults);
router.get("/names", getUniqueVoteNames);

export default router;
