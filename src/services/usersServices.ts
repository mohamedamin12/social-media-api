import mongoose, { UpdateWriteOpResult } from "mongoose";
import {
  User,
  IUser,
  IFriendRequest,
  IUserGroup,
  INotification,
} from "../models/usersModel";
import bcrypt from "bcrypt";
import { TServiceResult } from "../types/serviceResult";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import generateJwt from "../utils/generateJwt";


const getAllUsersService = async (): Promise<IUser[]> => {
  const users = await User.find({}, { __v: 0 });
  return users;
};

const getUserByIdService = async (
  userId: string
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId, { password: 0, __v: 0 });
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { data: user, type: "success" };
};

const createUserService = async (
  userData: Partial<IUser>
): Promise<TServiceResult<IUser> & { token: string }> => {
  const { username, email, role, password } = userData;
  const hashedPassword = bcrypt.hashSync(password!, 10);
  userData.password = hashedPassword;
  const user = new User(userData);
  await user.save();
  const token = await generateJwt({
    id: user._id,
    username,
    email,
    role,
  });
  return { data: user, token, type: "success" };
};

const updateUserService = async (
  userId: string,
  updateData: {
    username?: string;
    password?: string;
    email?: string;
    gender?: number;
    age?: string;
    profilePicture?: string;
  }
): Promise<TServiceResult<IUser>> => {
  const { profilePicture, password } = updateData;
  const user = await User.findById(userId);

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  let hashedPassword;

  if (password) {
    hashedPassword = bcrypt.hashSync(password, 10);
  }
  console.log(updateData);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...updateData,
        profilePicture: profilePicture || user.profilePicture,
        password: hashedPassword || user.password,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    const error = AppError.create(
      "An error occurred during updating the user, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  return { data: updatedUser, type: "success" };
};

const deleteUserService = async (
  userId: string
): Promise<TServiceResult<IUser>> => {
  const deletedUser = await User.findByIdAndDelete( userId );
  if (!deletedUser) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { type: "success" };
};

const joinGroupService = async (
  userId: string,
  groupData: IUserGroup
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.groups.push({
    groupId: groupData.groupId,
    notifications: groupData.notifications,
  });
  await user.save();
  return { data: user, type: "success" };
};

const leaveGroupService = async (
  userId: string,
  groupId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.groups.filter((group) => group.groupId !== groupId);
  await user.save();
  return { data: user, type: "success" };
};

const addNotificationsService = async (
  userId: string,
  notificationData: INotification
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.notifications.push(notificationData);
  await user.save();
  return { data: user, type: "success" };
};

const markNotificationAsReadService = async (
  userId: string,
  notificationId: mongoose.Types.ObjectId
) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  const notificationToUpdate = user.notifications.find(
    (notification) => (notification._id as unknown) === notificationId
  );
  if (!notificationToUpdate) {
    const error = AppError.create(
      "Invalid notification id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  notificationToUpdate.read = true;
  await user.save();
  return { data: user, type: "success" };
};

const removeNotificationsService = async (
  userId: string,
  notificationId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.notifications.filter(
    (notification) => (notification._id as unknown) !== notificationId
  );
  await user.save();
  return { data: user, type: "success" };
};

export default {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
  joinGroupService,
  leaveGroupService,
  addNotificationsService,
  markNotificationAsReadService,
  removeNotificationsService,
};