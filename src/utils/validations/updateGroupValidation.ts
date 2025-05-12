import { body } from "express-validator";

const updateGroupValidation = () => {
  return [
    body("groupName")
      .optional()
      .isLength({ min: 4 })
      .withMessage("Group name must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Group name must be at most 20 characters long"),
    body("isPrivate")
      .optional()
      .customSanitizer((value) => value.toLowerCase())
      .isIn(["true", "false"])
      .withMessage("Is private value must be true or false"),
    body("userId")
      .notEmpty()
      .withMessage("Users id is required")
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ObjectId"),
  ];
};

export default updateGroupValidation;