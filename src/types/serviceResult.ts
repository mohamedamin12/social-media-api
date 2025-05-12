import { TAppError } from "../utils/appError";

export type TServiceResult<T = unknown> =
  | { type: "success"; data?: T }
  | { type: "error"; error: TAppError };