import mongoose from "mongoose";

export interface IReport {
  reason: string;
  reportedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
}