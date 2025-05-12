import { body } from "express-validator";

const handleJoinRequestValidation = () => {
  return [
    body("adminId").notEmpty().withMessage("Admin id is required"),
    body("requestingUserId")
      .notEmpty()
      .withMessage("Requesting user id is required"),
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .customSanitizer((value) => value.toLowerCase())
      .isIn(["accepted", "declined"])
      .withMessage("Status value must be [accepted, declined]"),
  ];
};

export default handleJoinRequestValidation;