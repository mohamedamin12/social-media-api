import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import { TCurrentUser } from "../types/currentUser";

const isAllowed = (...roles: string[]) => {
  //TODO add the user type that comes from the database
  return (
    req: Request & { currentUser?: TCurrentUser },
    res: Response,
    next: NextFunction
  ) => {
    const userRole = req.currentUser?.role;
    if (!roles.includes(userRole!)) {
      const error = AppError.create(
        "You are not allowed to do this action",
        401,
        httpStatusText.FAIL
      );
      return next(error);
    }
    next();
  };
};

export default isAllowed;