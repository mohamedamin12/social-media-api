import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import searchServices from "../services/searchServices";
import httpStatusText from "../utils/httpStatusText";
import { validationResult } from "express-validator";
import AppError from "../utils/appError";

const search = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const query = req.query as { limit?: string; page?: string };
    const limit = parseInt(query.limit || "10", 10);
    const page = parseInt(query.page || "1", 10);
    const skip = (page - 1) * limit;

    const { searchTerm } = req.params;
    const { type } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const searchResult = await searchServices.searchService(type, searchTerm, {
      limit,
      skip,
    });
    if (searchResult.type === "success") {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { [type]: searchResult.data },
      });
    } else {
      const error = AppError.create(
        "An error occurred during the search, please try again later",
        400,
        httpStatusText.ERROR
      );
      return next(error);
    }
  }
);

export { search };