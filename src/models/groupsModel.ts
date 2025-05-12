import mongoose from "mongoose";
import { IReport } from "../types/report";

export interface IGroup extends Document {
  groupName: string;
  createdBy: mongoose.Types.ObjectId;
  groupMembers: mongoose.Types.ObjectId[];
  posts: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  groupCover: string;
  isPrivate: boolean;
  joinRequests: mongoose.Types.ObjectId[];
  reports: IReport[];
  banned: boolean;
  isDeleted: boolean;
  createdAt?: Date;
}

const groupsSchema = new mongoose.Schema<IGroup>(
  {
    groupName: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      immutable: true,
      required: true,
    },
    groupMembers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [
        function (value: []) {
          return value.length <= 5000;
        },
        "Group members exceed the limit of 5000 users",
      ],
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupCover: { type: String },
    isPrivate: { type: Boolean, default: false },
    joinRequests: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: false,
      default: undefined,
    },
    reports: [
      {
        reason: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    banned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, immutable: true, default: Date.now },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

groupsSchema.pre("save", function (next) {
  if (this.isPrivate && !this.joinRequests) {
    this.joinRequests = [];
  }
  next();
});

groupsSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<IGroup>;
  if (!update) {
    return;
  }
  if (update.isPrivate && !update.joinRequests) {
    this.setUpdate({ ...update, joinRequests: [] });
  }
  next();
});

groupsSchema.pre("save", function (next) {
  if (this.reports.length >= 10) this.banned = true;
  next();
});
export const Group = mongoose.model<IGroup>("Group", groupsSchema);