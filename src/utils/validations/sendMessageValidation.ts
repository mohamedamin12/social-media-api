import { body } from "express-validator";

const sendMessageValidation = () => {
  return [
    body("senderId")
      .notEmpty()
      .withMessage("Sender id is required")
      .isMongoId()
      .withMessage("Sender ID must be a valid MongoDB ObjectId"),
    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ max: 5000 })
      .withMessage("Message content must be at most 5000 characters"),
  ];
};

export default sendMessageValidation;