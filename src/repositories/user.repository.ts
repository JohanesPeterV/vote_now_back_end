import { User, UserModel } from "../models/user.model";
import { MongoError } from "mongodb";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email });
  }

  async create(user: Omit<User, "_id">): Promise<User> {
    try {
      return await UserModel.create(user);
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new Error("User already exists");
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return UserModel.find();
  }
}
