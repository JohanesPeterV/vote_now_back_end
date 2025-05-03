import { Request, Response, NextFunction } from "express";

type Role = "admin" | "user";

export const authorizeRole = (requiredRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};
