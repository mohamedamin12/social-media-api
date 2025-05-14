import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import pagesServices from "../services/pagesServices";
import httpStatusText from "../utils/httpStatusText";
import AppError from "../utils/appError";
import { validationResult } from "express-validator";

const getAllPages = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const query = req.query as { limit?: string; page?: string };
    const limit = parseInt(query.limit || "10", 10);
    const page = parseInt(query.page || "1", 10);
    const skip = (page - 1) * limit;

    const getAllPagesResult = await pagesServices.getAllPagesService({
      limit,
      skip,
    });

    if (getAllPagesResult.type === "error") {
      return next(getAllPagesResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { pages: getAllPagesResult.data },
      });
    }
  }
);

const getPageById = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;

    const getPageResult = await pagesServices.getPageByIdService(pageId);

    if (getPageResult.type === "error") {
      return next(getPageResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { page: getPageResult.data },
      });
    }
  }
);

const createPage = asyncWrapper(
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

    const pageCover = req.file?.path;
    const createPageResult = await pagesServices.createPageService({
      ...req.body,
      pageCover,
    });

    if (createPageResult.type === "error") {
      return next(createPageResult.error);
    } else {
      return res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { page: createPageResult.data },
      });
    }
  }
);

const updatePage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;
    const { userId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const pageCover = req.file?.path;

    const updatePageResult = await pagesServices.updatePageService(
      pageId,
      userId,
      { ...req.body, pageCover }
    );

    if (updatePageResult.type === "error") {
      return next(updatePageResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { page: updatePageResult.data },
      });
    }
  }
);

const deletePage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;
    const { userId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const deletePageResult = await pagesServices.deletePageService(
      pageId,
      userId
    );

    if (deletePageResult.type === "error") {
      return next(deletePageResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Page deleted successfully" },
      });
    }
  }
);

const addFollowers = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;
    const { userId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const addFollowersResult = await pagesServices.addFollowersService(
      pageId,
      userId
    );

    if (addFollowersResult.type === "error") {
      return next(addFollowersResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You are now following this page" },
      });
    }
  }
);

const removeFollowers = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;
    const { userId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const removeFollowersResult = await pagesServices.removeFollowersService(
      pageId,
      userId
    );

    if (removeFollowersResult.type === "error") {
      return next(removeFollowersResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You are not following this page anymore" },
      });
    }
  }
);

export {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  addFollowers,
  removeFollowers,
};