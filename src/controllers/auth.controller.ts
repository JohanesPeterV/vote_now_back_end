import { RequestHandler } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    await authService.register({ email, password });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists") {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};
