import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import reportsServices from "../services/reportsServices";
import httpStatusText from "../utils/httpStatusText";
import { validationResult } from "express-validator";
import AppError from "../utils/appError";

const addReport = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { type, reportedItemId, reason, reportedBy } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const reportItem = { type, reportedItemId };
    const reportData = { reason, reportedBy };

    const reportResult = await reportsServices.addReportService(
      reportItem,
      reportData
    );

    if (reportResult.type === "error") {
      return next(reportResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Report added successfully" },
      });
    }
  }
);

const removeReport = asyncWrapper(
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

    const removeReportResult = await reportsServices.removeReportService(
      req.body
    );

    if (removeReportResult.type === "error") {
      return next(removeReportResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Report removed successfully" },
      });
    }
  }
);

export { addReport, removeReport };