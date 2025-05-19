import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addFriendRequest,
  updateFriendRequestStatusService,
  addToBlockList,
  removeFromBlockList,
  addFollowedUsers,
  removeFollowedUsers,


} from "../controllers/usersController";
import upload from "../utils/cloudinary";
import createAndUpdateUserValidation from "../utils/validations/createAndUpdateUserValidation";
import updateFriendRequestStatusValidation from "../utils/validations/updateFriendRequestStatusValidation";
import sendFriendRequestValidation from "../utils/validations/sendFriendRequestValidation";
import addOrRemoveFollowedUsersValidation from "../utils/validations/addOrRemoveFollowedUsersValidation";
import removeReportValidation from "../utils/validations/removeReportValidation";
import verifyToken from "../middlewares/verifyToken";
import addReportValidation from "../utils/validations/addReportValidation";
import { addReport, removeReport } from "../controllers/reportsController";
import isAllowed from "../middlewares/isAllowed";

const usersRouter = Router();

// Get all users
usersRouter.route("/").get(
  verifyToken,
  isAllowed("admin", "superAdmin"),
  getAllUsers
);

// Get a user by ID
usersRouter.route("/:userId").get(verifyToken, getUserById);

// Create user
usersRouter
  .route("/")
  .post(
    verifyToken,
    isAllowed("admin", "superAdmin"),
    upload.single("profilePicture"),
    createAndUpdateUserValidation(false),
    createUser
  );


// Update user by ID
usersRouter
  .route("/:userId")
  .patch(
    verifyToken,
    upload.single("profilePicture"),
    createAndUpdateUserValidation(true),
    updateUser
  );

// Delete user by ID
usersRouter.route("/:userId").delete(
  verifyToken, 
  isAllowed("user", "superAdmin"),
  deleteUser
);

// Remove a report
usersRouter.route("/reports").delete(
  verifyToken,
  removeReportValidation(),
  removeReport
);

// Add friend request by user ID
usersRouter
  .route("/:senderId/friend-requests")
  .post(verifyToken, sendFriendRequestValidation(), addFriendRequest);

// Update friend request by user ID
usersRouter
  .route("/:userId/friend-requests")
  .patch(
    verifyToken,
    updateFriendRequestStatusValidation(),
    updateFriendRequestStatusService
  );

// Add to block list by user ID
usersRouter.route("/:userId/block-list").post(verifyToken, addToBlockList);

// Update block list by user ID
usersRouter
  .route("/:userId/block-list")
  .delete(verifyToken, removeFromBlockList);


// Add followed users by user ID
usersRouter
  .route("/:userId/followed-users")
  .post(verifyToken, addOrRemoveFollowedUsersValidation(), addFollowedUsers);

// Remove followed users by user ID
usersRouter
  .route("/:userId/followed-users")
  .delete(
    verifyToken,
    addOrRemoveFollowedUsersValidation(),
    removeFollowedUsers
  );


// Report a user
usersRouter.route("/reports").post(addReportValidation(), addReport);

export default usersRouter;