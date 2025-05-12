import { body } from "express-validator";

const joinGroupValidation = () => {
  return [
    body("userId").notEmpty().withMessage("User id is required"),
    body("notifications")
      .optional()
      .isBoolean()
      .withMessage("Notifications must be a boolean value [true, false]"),
  ];
};

export default joinGroupValidation;