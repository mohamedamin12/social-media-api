import mongoose from "mongoose";
import { Post, IPost } from "../models/postsModel";
import { User } from "../models/usersModel";
import { Group } from "../models/groupsModel";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import { TServiceResult } from "../types/serviceResult";
import { Page } from "../models/pagesModel";
import notificationsServices from "./notificationsServices";

const getAllPostsService = async (
  type: "user" | "group" | "page",
  postSourceId: string,
  paginationData: { limit: number; skip: number }
): Promise<TServiceResult<IPost[]>> => {
  const { limit, skip } = paginationData;
  let posts: IPost[] = [];
  switch (type) {
    case "user":
      posts = await Post.find({ createdBy: postSourceId }, { __V: 0 })
        .limit(limit)
        .skip(skip);
      break;
    case "group":
      const group = await Group.findById(postSourceId);
      if (!group) {
        const error = AppError.create(
          "Invalid group id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }
      posts = await Post.find({ _id: { $in: group.posts } }, { __V: 0 })
        .limit(limit)
        .skip(skip);
      break;
    case "page": // TODO
      const page = await Page.findById(postSourceId);
      if (!page) {
        const error = AppError.create(
          "Invalid page id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }
      posts = await Post.find({ _id: { $in: page.posts } }, { __V: 0 })
        .limit(limit)
        .skip(skip);
      break;
  }

  if (!posts) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { data: posts, type: "success" };
};

const getPostByIdService = async (
  postId: string
): Promise<TServiceResult<IPost>> => {
  const post = await Post.findById(postId, { __v: 0 });
  if (!post) {
    const error = AppError.create("Invalid post id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { data: post, type: "success" };
};

const createPostService = async (postData: {
  type: "user" | "group" | "page";
  postTitle?: string;
  postContent: string;
  postImages?: string[];
  createdBy: string;
  groupId?: string;
  pageId?: string;
}): Promise<TServiceResult<IPost>> => {
  const {
    type,
    postTitle,
    postContent,
    postImages,
    createdBy,
    groupId,
    pageId,
  } = postData;
  const user = await User.findById(createdBy);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const post = new Post({
    postTitle: postTitle || "",
    postContent,
    images: postImages || [],
    createdBy,
  });

  if (!post) {
    const error = AppError.create(
      "An error occured during creating the post, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  switch (type) {
    case "user":
      await post.save();
      break;
    case "group":
      const group = await Group.findById(groupId);
      if (!group) {
        const error = AppError.create(
          "Invalid group id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }
      group.posts.push(post._id);
      await post.save();
      await group.save();
      break;
    case "page":
      const page = await Page.findById(pageId);
      if (!page) {
        const error = AppError.create(
          "Invalid page id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }
      page.posts.push(post._id);
      await post.save();
      await page.save();
      break;
  }

  user.posts.push({ postId: post._id, isShared: false });
  await user.save();

  return { data: post, type: "success" };
};

const updatePostService = async (
  userId: string,
  postId: string,
  updateData: { postTitle?: string; postContent?: string; images?: string[] }
): Promise<TServiceResult<IPost>> => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!post) {
    const error = AppError.create("Invalid post id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  // Checking if the requesting update user is the creator of the post
  const isUserPostCreator = post.createdBy.toString() === userId;
  if (!isUserPostCreator) {
    const error = AppError.create(
      "You can't update this post, only the creator can edit this post",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $set: updateData },
    { new: true }
  );
  if (!updatedPost) {
    const error = AppError.create(
      "An error occured during the post update, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  return { data: updatedPost, type: "success" };
};

const deletePostService = async (
  postId: string,
  userId: string
): Promise<TServiceResult<IPost>> => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId);
  if (!post) {
    const error = AppError.create("Invalid post id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const isUserPostCreator = post.createdBy.toString() === userId;
  if (!isUserPostCreator) {
    const error = AppError.create(
      "Only post creator can delete this post",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (post.isDeleted) {
    const error = AppError.create(
      "This post is already deleted",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  post.isDeleted = true;
  await post.save();
  return { type: "success" };
};

const handleLikePostService = async (
  postId: string,
  userId: mongoose.Types.ObjectId
): Promise<TServiceResult<IPost> & { status?: "liked" | "unliked" }> => {
  const post = await Post.findById(postId);
  const user = await User.findById(userId);

  if (!post) {
    const error = AppError.create("Invalid post id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userLikedPost = post.likes.find(
    (like) => like.toString() === userId.toString()
  );

  if (userLikedPost) {
    post.likes = post.likes.filter(
      (like) => like.toString() !== userId.toString()
    );
    await post.save();
    return { status: "unliked", type: "success" };
  } else {
    post.likes.push(userId);
    const addNotificationResult =
      await notificationsServices.addNotificationService(
        "likePost",
        post.createdBy,
        { username: user.username }
      );
    await post.save();
    if (addNotificationResult.type === "error") {
      return { error: addNotificationResult.error!, type: "error" };
    }
    return { status: "liked", type: "success" };
  }
};

const addCommentService = async (
  postId: string,
  commentData: {
    content: string;
    createdBy: mongoose.Types.ObjectId;
  }
): Promise<TServiceResult<IPost>> => {
  const { createdBy } = commentData;
  const post = await Post.findById(postId);
  const user = await User.findById(createdBy);

  if (!post) {
    const error = AppError.create("Invalid post id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  post.comments.push(commentData);
  await post.save();
  const addNotificationResult =
    await notificationsServices.addNotificationService(
      "commentPost",
      post.createdBy,
      { username: user.username, content: commentData.content }
    );
  if (addNotificationResult.type === "error") {
    return { error: addNotificationResult.error!, type: "error" };
  }
  return { type: "success" };
};

const deleteCommentService = async (
  postId: string,
  userId: string,
  commentId: string
): Promise<TServiceResult<IPost>> => {
  const post = await Post.findById(postId);
  const user = await User.findById(userId);

  if (!post) {
    const error = AppError.create("Invalid post id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const commentExists = post.comments.find(
    (comment) => comment._id!.toString() === commentId
  );
  if (!commentExists) {
    const error = AppError.create(
      "Comment does not exist",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const isUserCommentCreator = post.comments.find(
    (comment) => comment.createdBy.toString() === userId
  );
  if (!isUserCommentCreator) {
    const error = AppError.create(
      "Only the comment creator can delete this comment",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  post.comments = post.comments.filter(
    (comment) => comment._id!.toString() !== commentId
  );

  await post.save();
  return { type: "success" };
};

const sharePostService = async (
  postId: string,
  userId: string
): Promise<TServiceResult<IPost>> => {
  const post = await Post.findById(postId);
  const user = await User.findById(userId);

  if (!post) {
    const error = AppError.create("Invalid post id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  user.posts.push({ postId: post._id, isShared: true });
  post.shares.push(user._id);
  await user.save();
  await post.save();
  const addNotificationResult =
    await notificationsServices.addNotificationService(
      "sharePost",
      post.createdBy,
      { username: user.username }
    );
  if (addNotificationResult.type === "error") {
    return { error: addNotificationResult.error!, type: "error" };
  }
  return { type: "success" };
};

export default {
  getAllPostsService,
  getPostByIdService,
  createPostService,
  updatePostService,
  deletePostService,
  handleLikePostService,
  addCommentService,
  deleteCommentService,
  sharePostService,
};