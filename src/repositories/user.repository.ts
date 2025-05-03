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

  async deleteById(id: string): Promise<User | null> {
    return UserModel.findByIdAndDelete(id);
  }

  async updateById(
    id: string,
    data: Partial<Omit<User, "_id">>
  ): Promise<User | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new Error("Email already exists");
      }
      throw error;
    }
  }
}
