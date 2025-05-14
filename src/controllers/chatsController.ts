import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import chatsServices from "../services/chatsServices";
import httpStatusText from "../utils/httpStatusText";
import { validationResult } from "express-validator";
import AppError from "../utils/appError";

const getAllChats = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    // const { userId } = req.query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const getChatsResult = await chatsServices.getAllChatsService(
      req.query.userId as string
    );

    if (getChatsResult.type === "error") {
      return next(getChatsResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { chats: getChatsResult.data },
      });
    }
  }
);

const createOrGetChat = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { firstUserId, secondUserId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const createChatResult = await chatsServices.createOrGetChatService(
      firstUserId,
      secondUserId
    );

    if (createChatResult.type === "error") {
      return next(createChatResult.error);
    } else {
      return res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { chat: createChatResult.data },
      });
    }
  }
);

const sendMessage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { chatId } = req.params;
    const { senderId, content } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const sendMessageResult = await chatsServices.sendMessageService(
      chatId,
      senderId,
      content
    );
    if (sendMessageResult.type === "error") {
      return next(sendMessageResult.error);
    } else {
      // io.to(chatId).emit("chat message", content);
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: sendMessageResult.data },
      });
    }
  }
);

const updateOrDeleteMessage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { chatId } = req.params;
    const { type } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const updateOrDeleteMessageResult =
      await chatsServices.updateOrDeleteMessageService(chatId, req.body);
    if (updateOrDeleteMessageResult.type === "error") {
      return next(updateOrDeleteMessageResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
          message: `Message ${
            type === "update" ? "updated" : "deleted"
          } successfully`,
        },
      });
    }
  }
);

export { getAllChats, createOrGetChat, sendMessage, updateOrDeleteMessage };