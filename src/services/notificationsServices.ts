import mongoose from "mongoose";
import { User } from "../models/usersModel";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import notificationsMessages from "../utils/notificationsMessages";

const addNotificationService = async (
  type:
    | "likePost"
    | "commentPost"
    | "sharePost"
    | "followPage"
    | "joinGroup"
    | "leaveGroup",
  sourceId: mongoose.Types.ObjectId,
  additionalData: {
    username: string;
    content?: string;
  }
) => {
  const user = await User.findById(sourceId);
  if (!user) {
    const error = AppError.create(
      "An error occurred during liking the post, pleases try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  switch (type) {
    case "likePost":
      user.notifications.push({
        message: notificationsMessages.likePostMessage(additionalData.username),
      });
      break;
    case "commentPost":
      user.notifications.push({
        message: notificationsMessages.commentPostMessage(
          additionalData.username,
          additionalData.content!
        ),
      });
      break;
    case "sharePost":
      user.notifications.push({
        message: notificationsMessages.sharePostMessage(additionalData.username),
      });
      break;
    case "followPage":
      user.notifications.push({
        message: notificationsMessages.sharePostMessage(additionalData.username),
      });
      break;
    case "joinGroup":
      user.notifications.push({
        message: notificationsMessages.joinGroupMessage(
          additionalData.username,
          additionalData.content!
        ),
      });
    case "leaveGroup":
      user.notifications.push({
        message: notificationsMessages.leaveGroupMessage(
          additionalData.username,
          additionalData.content!
        ),
      });
      break;
  }
  await user.save();
  return { type: "success" };
};

export default {
  addNotificationService,
};