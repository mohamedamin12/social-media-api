import { body } from "express-validator";

const addOrRemoveFollowedUsersValidation = () => {
  return [
    body("followedUserId")
      .notEmpty()
      .withMessage("Followed user id is required"),
  ];
};

export default addOrRemoveFollowedUsersValidation;