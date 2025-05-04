import mongoose, { Document, Schema } from "mongoose";

export interface Vote extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
}

export type VoteInput = {
  userId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
};

const voteSchema = new Schema<Vote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const VoteModel = mongoose.model<Vote>("Vote", voteSchema);
