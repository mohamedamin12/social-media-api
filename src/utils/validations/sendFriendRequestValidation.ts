import { body, param } from "express-validator";

const sendFriendRequestValidation = () => {
  return [
    body("recipientId").notEmpty().withMessage("Recipient id is required"),
  ];
};

export default sendFriendRequestValidation;