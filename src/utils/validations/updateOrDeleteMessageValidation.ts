import { body } from "express-validator";

const updateOrDeleteMessageValidation = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .customSanitizer((value) => value.toLowerCase())
      .isIn(["update", "delete"])
      .withMessage("Type value must be [update, delete]"),
    body("senderId")
      .notEmpty()
      .withMessage("Sender id is required")
      .isMongoId()
      .withMessage("Sender ID must be a valid MongoDB ObjectId"),
    body("messageId")
      .notEmpty()
      .withMessage("Message id is required")
      .isMongoId()
      .withMessage("Message ID must be a valid MongoDB ObjectId"),
    body("newContent")
      .optional()
      .notEmpty()
      .withMessage("New content is required")
      .isLength({ max: 5000 })
      .withMessage("Message content must be at most 5000 characters"),
  ];
};

export default updateOrDeleteMessageValidation;