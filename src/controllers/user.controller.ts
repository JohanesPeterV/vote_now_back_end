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

export const deleteUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUserById(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

export const updateUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body;
    const user = await userService.updateUserById(id, {
      email,
      password,
      role,
    });
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === "Email already exists") {
        res.status(400).json({ message: error.message });
        return;
      }
    }
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};
