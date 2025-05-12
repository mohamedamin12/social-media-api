import { body } from "express-validator";

const updatePageValidation = () => {
  return [
    body("pageName")
      .optional()
      .isLength({ min: 4 })
      .withMessage("Page name must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Page name must be at most 20 characters long"),
    body("userId")
      .notEmpty()
      .withMessage("Users id is required")
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ObjectId"),
  ];
};

export default updatePageValidation;