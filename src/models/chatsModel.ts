import mongoose from "mongoose";

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  seen: boolean;
  createdAt?: Date;
}


export interface IChat {
  participants: mongoose.Types.ObjectId[]; // Two users
  messages: IMessage[];
  createdAt?: Date;
  lastUpdated: Date;
}


const chatSchema = new mongoose.Schema<IChat>(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String, required: true },
        createdAt: { type: Date, immutable: true, default: Date.now },
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);