import { User, IUser } from "../models/user";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async create(userData: {
    email: string;
    password: string;
    role: string;
  }): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }
}
