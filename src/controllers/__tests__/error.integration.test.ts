import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
import { VoteModel } from "../../models/vote.model";
import { UserModel } from "../../models/user.model";
import { setupTestDB } from "../../config/__tests__/setup";

describe("Error Handler Integration", () => {
  let validToken: string;

  setupTestDB();

  beforeEach(async () => {
    await VoteModel.deleteMany({});
    await UserModel.deleteMany({});

    const user = await UserModel.create({
      email: "test@example.com",
      password: "Password123",
      role: "user",
    });

    validToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "test_secret",
      { expiresIn: "1h" }
    );
  });

  it("should handle validation errors", async () => {
    const response = await request(app)
      .post("/api/votes")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ name: "" });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Name is required");
  });

  it("should handle duplicate vote errors", async () => {
    await request(app)
      .post("/api/votes")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ name: "Candidate A" });

    const response = await request(app)
      .post("/api/votes")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ name: "Candidate B" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "User has already voted");
  });

  it("should handle JWT errors", async () => {
    const response = await request(app)
      .post("/api/votes")
      .set("Authorization", "Bearer invalid-token")
      .send({ name: "Candidate A" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  it("should handle unknown errors", async () => {
    jest.spyOn(VoteModel, "aggregate").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const response = await request(app).get("/api/votes/result");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty(
      "message",
      "Error fetching vote results"
    );
  });
});

describe("Error Handling Integration Tests", () => {
  setupTestDB();

  describe("404 Not Found", () => {
    it("should return 404 for non-existent route", async () => {
      const res = await request(app).get("/non-existent-route");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Route not found");
    });
  });

  describe("500 Internal Server Error", () => {
    it("should return 500 for unhandled errors", async () => {
      const res = await request(app).get("/api/error");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "Internal Server Error");
    });
  });
});
