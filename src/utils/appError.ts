import { ValidationError } from "express-validator";

export type TAppError = {
  message: string | ValidationError[];
  statusCode: number;
  statusText: string;
  create(message: string, statusCode: number, statusText: string): TAppError;
};

class AppError extends Error implements TAppError {
  public statusCode!: number;
  public statusText!: string;

  constructor() {
    super();
  }

  create(
    message: string | ValidationError[],
    statusCode: number,
    statusText: string
  ): this {
    //@ts-ignore
    this.message = message;
    this.statusCode = statusCode;
    this.statusText = statusText;
    return this;
  }
}

export default new AppError();