import mongoose from "mongoose";
import { IUser, User } from "../models/usersModel";
import { TServiceResult } from "../types/serviceResult";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";

const addFollowedUserService = async (
  userId: string,
  followedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  const followedUser = await User.findById(followedUserId);

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!followedUser) {
    const error = AppError.create(
      "Invalid followed user id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const followAlreadyExists = user.followedUsers.includes(followedUserId);
  if (followAlreadyExists) {
    const error = AppError.create(
      "You are already following this user",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  user.followedUsers.push(followedUserId);
  followedUser.followers.push(user._id);
  await user.save();
  await followedUser.save();
  return { data: user, type: "success" };
};

const removeFollowedUserService = async (
  userId: string,
  followedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  const followedUser = await User.findById(followedUserId);

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!followedUser) {
    const error = AppError.create(
      "Invalid followed user id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const userIsFollowingTheFollowedUser = user.followedUsers.find(
    (followed) => followed.toString() === followedUserId.toString()
  );
  if (!userIsFollowingTheFollowedUser) {
    const error = AppError.create(
      "You can't unfollow this user as you didn't follow him before",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  user.followedUsers = user.followedUsers.filter(
    (user) => user.toString() !== followedUserId.toString()
  );
  followedUser.followers = followedUser.followers.filter(
    (user) => user.toString() !== userId
  );

  await user.save();
  followedUser.save();
  return { type: "success" };
};

const addFollowedPagesService = async (
  userId: string,
  followedPageId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  const followAlreadyExists = user.followedPages.includes(followedPageId);
  if (followAlreadyExists) {
    const error = AppError.create(
      "You are already following this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  user.followedPages.push(followedPageId);
  await user.save();
  return { data: user, type: "success" };
};

const removeFollowedPagesService = async (
  userId: string,
  followedPageId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.followedUsers.filter((page) => page._id !== followedPageId);
  await user.save();
  return { data: user, type: "success" };
};

export default {
  addFollowedUserService,
  removeFollowedUserService,
  addFollowedPagesService,
  removeFollowedPagesService
};