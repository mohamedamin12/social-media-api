import { body } from "express-validator";

const userIdValidation = () => {
  return [
    body("userId")
      .notEmpty()
      .withMessage("User id is required")
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ObjectId"),
  ];
};

export default userIdValidation;