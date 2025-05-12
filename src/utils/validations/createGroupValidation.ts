import { body } from "express-validator";

const createGroupValidation = () => {
  return [
    body("groupName")
      .notEmpty()
      .withMessage("Group name is required")
      .isLength({ min: 4 })
      .withMessage("Group name must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Group name must be at most 20 characters long"),
    body("createdBy").notEmpty().withMessage("Created by is required"),
    body("isPrivate")
      .optional()
      .customSanitizer((value) => value.toLowerCase())
      .isIn(["true", "false"])
      .withMessage("Is private value must be true or false"),
  ];
};

export default createGroupValidation;