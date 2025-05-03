import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorize";

const router = Router();

router.get("/users", authenticateJWT, authorizeRole("admin"), getAllUsers);

export default router;
