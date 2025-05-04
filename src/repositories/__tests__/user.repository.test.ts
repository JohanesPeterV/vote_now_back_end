import { UserRepository } from "../user.repository";
import { UserModel } from "../../models/user.model";
import { setupTestDB } from "../../config/__tests__/setup";

describe("UserRepository", () => {
  let userRepository: UserRepository;

  setupTestDB();

  beforeAll(() => {
    userRepository = new UserRepository();
  });

  describe("findByEmail", () => {
    const testUser = {
      email: "test@example.com",
      password: "hashedPassword123",
      role: "user" as const,
    };

    beforeEach(async () => {
      await UserModel.create(testUser);
    });

    it("should find user by email", async () => {
      const user = await userRepository.findByEmail(testUser.email);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testUser.email);
      expect(user?.role).toBe(testUser.role);
    });

    it("should return null for non-existent email", async () => {
      const user = await userRepository.findByEmail("nonexistent@example.com");
      expect(user).toBeNull();
    });
  });

  describe("create", () => {
    const newUser = {
      email: "new@example.com",
      password: "hashedPassword123",
      role: "user" as const,
    };

    it("should create a new user", async () => {
      const user = await userRepository.create(newUser);
      expect(user).toBeDefined();
      expect(user.email).toBe(newUser.email);
      expect(user.role).toBe(newUser.role);
      expect(user._id).toBeDefined();
    });

    it("should throw error for duplicate email", async () => {
      await userRepository.create(newUser);
      await expect(userRepository.create(newUser)).rejects.toThrow(
        "User already exists"
      );
    });
  });

  describe("findAll", () => {
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

    it("should return all users", async () => {
      const users = await userRepository.findAll();
      expect(users).toHaveLength(2);
      expect(users[0].email).toBe(testUsers[0].email);
      expect(users[1].email).toBe(testUsers[1].email);
    });

    it("should return empty array when no users exist", async () => {
      await UserModel.deleteMany({});
      const users = await userRepository.findAll();
      expect(users).toHaveLength(0);
    });
  });
});
