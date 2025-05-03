import { RequestHandler } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export const getAllUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};
