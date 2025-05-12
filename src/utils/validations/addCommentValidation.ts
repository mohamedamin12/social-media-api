import { body } from "express-validator";

const addCommentValidation = () => {
  return [
    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 1 })
      .withMessage("Content must be at least 1 character long")
      .isLength({ max: 5000 })
      .withMessage("Content must be at most 5000 characters long"),
    body("createdBy")
      .notEmpty()
      .withMessage("Created by id is required")
      .isMongoId()
      .withMessage("Page ID must be a valid MongoDB ObjectId"),
  ];
};

export default addCommentValidation;