import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(): Promise<Omit<User, "password">[]> {
    const users = await this.userRepository.findAll();
    const sanitizedUsers = users.map((user) => ({
      _id: user._id,
      email: user.email,
      role: user.role,
    }));
    return sanitizedUsers;
  }

  async deleteUserById(id: string): Promise<void> {
    const deletedUser = await this.userRepository.deleteById(id);
    if (!deletedUser) {
      throw new Error("User not found");
    }
  }
}
