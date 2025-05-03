import { Request, Response, NextFunction } from "express";

type Role = "admin" | "user";

export const authorizeRole = (requiredRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    next();
  };
};
