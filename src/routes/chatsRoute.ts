import { Router } from "express";
import {
  createOrGetChat,
  getAllChats,
  sendMessage,
  updateOrDeleteMessage,
} from "../controllers/chatsController";
import createChatValidation from "../utils/validations/createChatValidation";
import sendMessageValidation from "../utils/validations/sendMessageValidation";
import updateOrDeleteMessageValidation from "../utils/validations/updateOrDeleteMessageValidation";

const chatsRouter = Router();

// Get all chats by user id
chatsRouter.route("/").get(getAllChats);

// Create or get chat if it already exists
chatsRouter.route("/").post(createChatValidation(), createOrGetChat);

// Send message
chatsRouter.route("/:chatId").post(sendMessageValidation(), sendMessage);

// Update or delete message
chatsRouter
  .route("/:chatId")
  .patch(updateOrDeleteMessageValidation(), updateOrDeleteMessage);

export default chatsRouter;