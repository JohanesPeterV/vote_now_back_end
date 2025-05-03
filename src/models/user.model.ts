import mongoose from "mongoose";

export interface User {
  _id: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

const userSchema = new mongoose.Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<User>("User", userSchema);
