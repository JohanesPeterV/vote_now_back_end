import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserService } from "../user.service";
import { UserModel } from "../../models/user.model";

describe("UserService", () => {
  let mongoServer: MongoMemoryServer;
  let userService: UserService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    userService = new UserService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe("getAllUsers", () => {
    const testUsers = [
      {
        email: "user1@example.com",
        password: "hashedPassword123",
        role: "user" as const,
      },
      {
        email: "user2@example.com",
        password: "hashedPassword123",
        role: "admin" as const,
      },
    ];

    beforeEach(async () => {
      await UserModel.insertMany(testUsers);
    });

    it("should return all users without passwords", async () => {
      const users = await userService.getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty("email", testUsers[0].email);
      expect(users[0]).toHaveProperty("role", testUsers[0].role);
      expect(users[0]).not.toHaveProperty("password");

      expect(users[1]).toHaveProperty("email", testUsers[1].email);
      expect(users[1]).toHaveProperty("role", testUsers[1].role);
      expect(users[1]).not.toHaveProperty("password");
    });

    it("should return empty array when no users exist", async () => {
      await UserModel.deleteMany({});
      const users = await userService.getAllUsers();
      expect(users).toHaveLength(0);
    });

    it("should include _id in returned users", async () => {
      const users = await userService.getAllUsers();
      expect(users[0]).toHaveProperty("_id");
      expect(users[1]).toHaveProperty("_id");
    });
  });
});
