import { body } from "express-validator";

const removeReportValidation = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .customSanitizer((value) => value.toLowerCase())
      .isIn(["user", "group", "page", "post"])
      .withMessage("Type value must be [user, group, page, post]"),
    body("reportedItemId")
      .notEmpty()
      .withMessage("Reported item id is required")
      .isMongoId()
      .withMessage("Reported item ID must be a valid mongoDB ObjectId"),

    body("userId").notEmpty().withMessage("User id is required"),
  ];
};

export default removeReportValidation;