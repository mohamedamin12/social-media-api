import { body } from "express-validator";

const getAllPostsValidation = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .customSanitizer((value) => value.toLowerCase())
      .isIn(["user", "group", "page"])
      .withMessage("Type value must be [user, group, page]"),
    body("postSourceId")
      .notEmpty()
      .withMessage("Post source id is required")
      .isMongoId()
      .withMessage("Post source ID must be a valid MongoDB ObjectId"),
  ];
};

export default getAllPostsValidation;