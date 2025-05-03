import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";

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

  async updateUserById(
    id: string,
    data: { email?: string; password?: string; role?: "admin" | "user" }
  ): Promise<Omit<User, "password">> {
    const updateData: Partial<User> = { ...data };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(data.password, salt);
    }

    const updatedUser = await this.userRepository.updateById(id, updateData);
    if (!updatedUser) {
      throw new Error("User not found");
    }

    return {
      _id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
    };
  }
}
