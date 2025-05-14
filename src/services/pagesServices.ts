import { IPage, Page } from "../models/pagesModel";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import { TServiceResult } from "../types/serviceResult";
import { User } from "../models/usersModel";
import notificationsServices from "./notificationsServices";

const getAllPagesService = async (paginationData: {
  limit: number;
  skip: number;
}): Promise<TServiceResult<IPage[]>> => {
  const { limit, skip } = paginationData;
  const pages = await Page.find({}, { __v: 0 }).limit(limit).skip(skip);
  return { data: pages, type: "success" };
};

const getPageByIdService = async (
  pageId: string
): Promise<TServiceResult<IPage>> => {
  const page = await Page.findById(pageId);
  if (!page) {
    const error = AppError.create("Invalid page ID", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { data: page, type: "success" };
};

const createPageService = async (pageData: {
  pageName: string;
  createdBy: string;
  pageCover?: string;
}): Promise<TServiceResult<IPage>> => {
  const { pageName, createdBy, pageCover } = pageData;
  const user = await User.findById(createdBy);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const page = new Page({
    pageName,
    createdBy,
    pageCover: pageCover || "",
  });

  if (!page) {
    const error = AppError.create(
      "An error occurred during creating the page, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  await page.save();
  return { data: page, type: "success" };
};

const updatePageService = async (
  pageId: string,
  userId: string,
  updateData: Partial<IPage>
): Promise<TServiceResult<IPage>> => {
  const { pageCover } = updateData;
  const page = await Page.findById(pageId);
  if (!page) {
    const error = AppError.create("Invalid page id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userIsPageOwner = page.createdBy.toString() === userId;
  if (!userIsPageOwner) {
    const error = AppError.create(
      "Only page owner can delete this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const updatedPage = await Page.findByIdAndUpdate(
    pageId,
    { $set: { ...updateData, pageCover: pageCover || page.pageCover } },
    { new: true }
  );

  if (!updatedPage) {
    const error = AppError.create(
      "An error occurred during updating the page, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  return { data: updatedPage, type: "success" };
};

const deletePageService = async (
  pageId: string,
  userId: string
): Promise<TServiceResult<IPage>> => {
  const user = await User.findById(userId);
  const page = await Page.findById(pageId);

  if (!page) {
    const error = AppError.create("Invalid page id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userIsPageOwner = page.createdBy.toString() === userId;
  if (!userIsPageOwner) {
    const error = AppError.create(
      "Only page owner can delete this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  page.isDeleted = true;
  await page.save();
  return { type: "success" };
};

const addFollowersService = async (
  pageId: string,
  userId: string
): Promise<TServiceResult<IPage>> => {
  const page = await Page.findById(pageId);
  const user = await User.findById(userId);
  if (!page) {
    const error = AppError.create("Invalid page id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userAlreadyFollowingPage = page.followers.find(
    (follower) => follower.toString() === userId
  );
  if (userAlreadyFollowingPage) {
    const error = AppError.create(
      "You are already following this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  page.followers.push(user._id);
  user.followedPages.push(page._id);
  await page.save();
  await user.save();
  const addNotificationResult =
    await notificationsServices.addNotificationService(
      "followPage",
      page.createdBy,
      { username: user.username, content: page.pageName }
    );
  if (addNotificationResult.type === "error") {
    return { error: addNotificationResult.error!, type: "error" };
  }
  return { data: page, type: "success" };
};

const removeFollowersService = async (
  pageId: string,
  userId: string
): Promise<TServiceResult<IPage>> => {
  const page = await Page.findById(pageId);
  const user = await User.findById(userId);
  if (!page) {
    const error = AppError.create("Invalid page id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userFollowingPage = page.followers.find(
    (follower) => follower.toString() === userId
  );
  if (!userFollowingPage) {
    const error = AppError.create(
      "You are not a follower of this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  page.followers = page.followers.filter(
    (follower) => follower.toString() !== userId
  );
  user.followedPages = user.followedPages.filter(
    (page) => page.toString() !== pageId
  );

  await page.save();
  await user.save();
  return { data: page, type: "success" };
};

export default {
  getAllPagesService,
  getPageByIdService,
  createPageService,
  updatePageService,
  deletePageService,
  addFollowersService,
  removeFollowersService,
};