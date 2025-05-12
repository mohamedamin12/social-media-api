import { Request, Response, NextFunction } from "express";

// Extend the Request interface to include the 'file' property
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}
import appError from "../appError";
import httpStatusText from "../httpStatusText.js";

const imageValidation = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    const error = appError.create(
      "No file uploaded",
      400,
      httpStatusText.ERROR
    );
    return next(error);
  }
  next();
};

export default imageValidation;