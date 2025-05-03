import { Router } from "express";
import {
  getAllUsers,
  deleteUserById,
  updateUserById,
} from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorize";

const router = Router();

router.get("/users", authenticateJWT, authorizeRole("admin"), getAllUsers);
router.delete(
  "/users/:id",
  authenticateJWT,
  authorizeRole("admin"),
  deleteUserById
);
router.patch(
  "/users/:id",
  authenticateJWT,
  authorizeRole("admin"),
  updateUserById
);

export default router;
