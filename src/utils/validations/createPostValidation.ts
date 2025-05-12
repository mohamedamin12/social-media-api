import { body } from "express-validator";

const createPostValidation = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .customSanitizer((value) => value.toLowerCase())
      .isIn(["user", "group", "page"])
      .withMessage("Type value must be [user, group, page]"),
    body("postTitle")
      .optional()
      .isLength({ min: 4 })
      .withMessage("Post title must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Post title must be at most 20 characters long"),
    body("postContent")
      .notEmpty()
      .withMessage("Post content is required")
      .isLength({ min: 10 })
      .withMessage("Post content must be at least 10 characters long")
      .isLength({ max: 5000 })
      .withMessage("Post content must be at most 5000 characters long"),
    body("createdBy").notEmpty().withMessage("Created by is required"),
    body("groupId")
      .if(body("type").equals("group"))
      .notEmpty()
      .withMessage("Group id is required for group type")
      .isMongoId()
      .withMessage("Group ID must be a valid MongoDB ObjectId"),
    body("pageId")
      .if(body("type").equals("page"))
      .notEmpty()
      .withMessage("Page ID is required for page type")
      .isMongoId()
      .withMessage("Page ID must be a valid MongoDB ObjectId"),
  ];
};

export default createPostValidation;