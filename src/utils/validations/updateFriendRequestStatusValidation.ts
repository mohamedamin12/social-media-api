import { body } from "express-validator";

const updateFriendRequestStatusValidation = () => {
  return [
    body("senderId").notEmpty().withMessage("Sender id is required"),
    body("newStatus")
      .notEmpty()
      .withMessage("New status is required")
      .customSanitizer((value) => value.toLowerCase()) // Convert to lowercase
      .isIn(["accepted", "declined"])
      .withMessage("New status must be accpeted or declined"),
  ];
};

export default updateFriendRequestStatusValidation;