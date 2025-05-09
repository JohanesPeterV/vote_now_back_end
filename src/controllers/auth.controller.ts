import { RequestHandler } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register({ email, password });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists") {
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.status(200).json({
      token,
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      res.status(401).json({ message: error.message });
      return;
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};
