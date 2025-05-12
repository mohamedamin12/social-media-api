import mongoose, { Document } from "mongoose";
import { IReport } from "../types/report";

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  postTitle?: string;
  postContent: string;
  images: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  isShared: boolean;
  reports: IReport[];
  shares: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  banned: boolean;
}

const postsSchema = new mongoose.Schema<IPost>(
  {
    postTitle: { type: String },
    postContent: { type: String, required: true },
    images: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    createdAt: { type: Date, immutable: true, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        content: { type: String, required: true },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: { type: Date, default: Date.now, immutable: true },
      },
    ],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [
      {
        reason: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

postsSchema.pre("save", function (next) {
  if (this.reports.length >= 10) this.banned = true;
  next();
});

export const Post = mongoose.model<IPost>("Post", postsSchema);