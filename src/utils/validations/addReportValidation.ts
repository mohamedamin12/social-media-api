import { body } from "express-validator";

const addReportValidation = () => {
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
    body("reportedBy")
      .notEmpty()
      .withMessage("Reported by is required")
      .isMongoId()
      .withMessage("Reported by ID must be a valid MongoDB ObjectId"),
    body("reason")
      .notEmpty()
      .withMessage("Reason is required")
      .isLength({ min: 4 })
      .withMessage("Reason must be at least 4 characters long")
      .isLength({ max: 5000 })
      .withMessage("Reason must be at most 5000 characters long"),
  ];
};

export default addReportValidation;