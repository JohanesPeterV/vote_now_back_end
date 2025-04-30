import bcrypt from "bcrypt";
import { RegisterInput } from "../validators/auth.validator";
import { UserRepository } from "../repositories/user.repository";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterInput) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    return this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      role: "user",
    });
  }
}
