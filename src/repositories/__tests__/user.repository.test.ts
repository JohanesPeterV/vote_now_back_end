import { connectDB, disconnectDB } from "../../config/db";
import { UserRepository } from "../user.repository";

describe("UserRepository", () => {
  const testUri = process.env.DB_URI;
  let userRepository: UserRepository;

  beforeAll(async () => {
    if (!testUri) {
      throw new Error("DB_URI environment variable is not set");
    }
    await connectDB(testUri);
    userRepository = new UserRepository();
  });
  afterAll(async () => {
    await disconnectDB();
  });

  describe("findByEmail", () => {
    it("should be able to find user by email", async () => {
      const userData = {
        email: "find-test@example.com",
        password: "hashedpassword",
        role: "user",
      };
      await userRepository.create(userData);

      const found = await userRepository.findByEmail(userData.email);
      expect(found?.email).toBe(userData.email);
    });

    it("should return null if user with email does not exist", async () => {
      const found = await userRepository.findByEmail("nonexistent@example.com");
      expect(found).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "create-test@example.com",
        password: "hashedpassword",
        role: "user",
      };

      const user = await userRepository.create(userData);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
    });
  });
});
