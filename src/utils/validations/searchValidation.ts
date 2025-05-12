import { body } from "express-validator";

const searchValidation = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .customSanitizer((value) => value.toLowerCase())
      .isIn(["users", "pages", "groups"])
      .withMessage("Type value must be [users, pages, groups]"),
  ];
};

export default searchValidation;