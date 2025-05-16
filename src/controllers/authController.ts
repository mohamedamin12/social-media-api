import e, { NextFunction, Request, Response } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import { validationResult } from "express-validator";
import appError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import authServices from "../services/authServices";

const register = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = appError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const registerResult = await authServices.registerService(req.body);
    if (registerResult.type === "error") {
      return next(registerResult.error);
    } else {
      return res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { token: registerResult.token },
      });
    }
  }
);

const login = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      const error = appError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const loginResult = await authServices.loginService(req.body);
    if (loginResult.type === "error") {
      return next(loginResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { token: loginResult.token },
      });
    }
  }
);


export  {
  register,   
  login,
};