import { body } from "express-validator";

const createChatValidation = () => {
  return [
    body("firstUserId")
      .notEmpty()
      .withMessage("First user id is required")
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ObjectId"),
    body("secondUserId")
      .notEmpty()
      .withMessage("Second user id is required")
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ObjectId"),
  ];
};

export default createChatValidation;