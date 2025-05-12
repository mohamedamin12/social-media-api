import mongoose from "mongoose";
import { IReport } from "../types/report";

export interface IFriendRequest {
  sender: mongoose.Types.ObjectId;
  status: "accepted" | "declined" | "pending"; // Enum for status
}

export interface ISentFriendRequest {
  sentTo: mongoose.Types.ObjectId;
  status: "accepted" | "declined" | "pending"; // Enum for status
}

// Define the type for the reports

export interface IMadeReports {
  reportedItemId: mongoose.Types.ObjectId;
  reason: string;
  createdAt?: Date;
}

// Define the type for the notifications
export interface INotification {
  _id?: { type: mongoose.Schema.Types.ObjectId };
  message: string;
  read?: boolean;
  createdAt?: Date;
}

// Define the type for the user's groups
export interface IUserGroup {
  groupId: mongoose.Types.ObjectId;
  notifications: boolean;
}

// Define the base User type extending the Mongoose Document
export interface IUser extends Document {
  username: string;
  age: number;
  email: string;
  password: string;
  gender: string;
  profilePicture: string;
  posts: { postId: mongoose.Types.ObjectId; isShared: boolean }[];
  groups: IUserGroup[];
  friendList: mongoose.Types.ObjectId[];
  friendRequests: IFriendRequest[];
  sentFriendRequests: ISentFriendRequest[];
  blockList: mongoose.Types.ObjectId[];
  followedUsers: mongoose.Types.ObjectId[];
  followedPages: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  chats: mongoose.Types.ObjectId[];
  notifications: INotification[];
  createdAt?: Date;
  updatedAt: Date;
  madeReports: IMadeReports[];
  reports: IReport[];
  banned: boolean;
  role: {
    type: String;
    enum: ["user", "superAdmin"];
    default: "user";
  }; // Restrict the role field to the enum values
  token: string;
}

const usersSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    profilePicture: {
      type: String,
      default: "https://example.com/default-profile-picture.png",
    },
    posts: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        isShared: { type: Boolean, default: false },
        _id: false,
      },
    ],
    groups: [
      {
        group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
        notifications: { type: Boolean, default: false },
      },
    ],
    friendList: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [
        function (value: []) {
          return value.length <= 500;
        },
        "Friend list exceeds the limit of 500 users",
      ],
    },
    friendRequests: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["accepted", "declined", "pending"],
          default: "pending",
        },
      },
    ],
    sentFriendRequests: [
      {
        sentTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["accepted", "declined", "pending"],
          default: "pending",
        },
      },
    ],
    blockList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followedPages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Page" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    notifications: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        }, // Generate a unique ID
        message: { type: String },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, immutable: true, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    madeReports: [
      {
        reportedItemId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reports: [
      {
        reason: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    banned: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "superAdmin"], default: "user" },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

usersSchema.pre<IUser>("save", function (next) {
  if (this.reports.length >= 10) this.banned = true;
  next();
});

export const User = mongoose.model<IUser>("User", usersSchema);