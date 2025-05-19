import { Router } from "express";
import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroupById,
  handleJoinRequests,
  joinGroup,
  leaveGroup,
  updateGroup,
} from "../controllers/groupsController";
import createGroupValidation from "../utils/validations/createGroupValidation";
import verifyToken from "../middlewares/verifyToken";
import isAllowed from "../middlewares/isAllowed";
import joinGroupValidation from "../utils/validations/joinGroupValidation";
import handleJoinRequestValidation from "../utils/validations/handleJoinRequestValidation";
import userIdValidation from "../utils/validations/userIdValidation";
import upload from "../utils/cloudinary";
import updateGroupValidation from "../utils/validations/updateGroupValidation";
import addReportValidation from "../utils/validations/addReportValidation";
import { addReport, removeReport } from "../controllers/reportsController";
import removeReportValidation from "../utils/validations/removeReportValidation";

const groupsRouter = Router();

// Get all groups
groupsRouter.route("/").get(verifyToken ,getAllGroups);

// Get group by ID
groupsRouter.route("/:groupId").get(verifyToken , getGroupById);

// Create group
groupsRouter
  .route("/")
  .post(
    verifyToken,
    isAllowed("user", "superAdmin"),
    upload.single("groupCover"),
    createGroupValidation(),
    createGroup
  );

// Update group
groupsRouter
  .route("/:groupId")
  .patch(
    verifyToken,
    upload.single("groupCover"),
    updateGroupValidation(),
    updateGroup
  );

  // Remove a report
  groupsRouter.route("/reports").delete(removeReportValidation(), removeReport);
  
  // Delete group
  groupsRouter.route("/:groupId").delete(verifyToken, deleteGroup);
  
  // Join group
  groupsRouter
  .route("/:groupId/join")
  .post(verifyToken, joinGroupValidation(), joinGroup);
  
  // Handle join request
  groupsRouter
  .route("/:groupId/join-requests")
  .post(verifyToken, handleJoinRequestValidation(), handleJoinRequests);
  
  // Leave group
  groupsRouter
  .route("/:groupId/leave")
  .post(verifyToken, userIdValidation(), leaveGroup);
  
  
  // Report a group
  groupsRouter.route("/reports").post(addReportValidation(), addReport);
  
  
  export default groupsRouter;