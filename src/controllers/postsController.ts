import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import postsServices from "../services/postsServices";
import httpStatusText from "../utils/httpStatusText";
import { validationResult } from "express-validator";
import AppError from "../utils/appError";

const getAllPosts = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { type, postSourceId } = req.body;
    const query = req.query as { limit?: string; page?: string };
    const limit = parseInt(query.limit || "10", 10);
    const page = parseInt(query.page || "1", 10);
    const skip = (page - 1) * limit;

    const getPostsResult = await postsServices.getAllPostsService(
      type,
      postSourceId,
      { limit, skip }
    );
    if (getPostsResult.type === "error") {
      return next(getPostsResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { posts: getPostsResult.data },
      });
    }
  }
);

const getPostById = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;
    const getPostResult = await postsServices.getPostByIdService(postId);
    if (getPostResult.type === "error") {
      return next(getPostResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { post: getPostResult.data },
      });
    }
  }
);

const createPost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const postImages = (req.files as Express.Multer.File[])?.map(
      (file) => file.path
    );

    const createPostResult = await postsServices.createPostService({
      ...req.body,
      postImages,
    });

    if (createPostResult.type === "error") {
      return next(createPostResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { post: createPostResult.data },
      });
    }
  }
);

const updatePost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    if (Object.keys(req.params).length === 0) {
      const error = AppError.create(
        "No data sent to update",
        400,
        httpStatusText.FAIL
      );
      return next(error);
    }
    const { postId } = req.params;
    const { userId, postTitle, postContent } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const updatePostResult = await postsServices.updatePostService(
      userId,
      postId,
      { postTitle, postContent }
    );

    if (updatePostResult.type === "error") {
      return next(updatePostResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { updatedPost: updatePostResult.data },
      });
    }
  }
);

const deletePost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;
    const { userId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const deletePostResult = await postsServices.deletePostService(
      postId,
      userId
    );

    if (deletePostResult.type === "error") {
      return next(deletePostResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Post deleted successfully" },
      });
    }
  }
);

const handleLikePost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;
    const { userId } = req.body;
    const handleLikePostResult = await postsServices.handleLikePostService(
      postId,
      userId
    );

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    if (handleLikePostResult.type === "error") {
      return next(handleLikePostResult.error);
    } else {
      if (handleLikePostResult.status === "liked") {
        return res.status(200).json({
          status: httpStatusText.SUCCESS,
          data: { message: "Post liked successfully" },
        });
      } else {
        return res.status(200).json({
          status: httpStatusText.SUCCESS,
          data: { message: "Post unlinked successfully" },
        });
      }
    }
  }
);

const addComment = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const addCommentResult = await postsServices.addCommentService(
      postId,
      req.body
    );
    if (addCommentResult.type === "error") {
      return next(addCommentResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Comment added successfully" },
      });
    }
  }
);

const deleteComment = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const deleteCommentResult = await postsServices.deleteCommentService(
      postId,
      userId,
      commentId
    );
    if (deleteCommentResult.type === "error") {
      return next(deleteCommentResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Comment deleted successfully" },
      });
    }
  }
);

const sharePost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;
    const { userId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const sharePostResult = await postsServices.sharePostService(
      postId,
      userId
    );

    if (sharePostResult.type === "error") {
      return next(sharePostResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Post shared successfully" },
      });
    }
  }
);

export {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  handleLikePost,
  addComment,
  deleteComment,
  sharePost,
};