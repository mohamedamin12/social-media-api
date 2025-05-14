import mongoose from "mongoose";
import { Group, IGroup } from "../models/groupsModel";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import { TServiceResult } from "../types/serviceResult";
import { User } from "../models/usersModel";
import notificationsServices from "./notificationsServices";

const getAllGroupsService = async (paginationData: {
  limit: number;
  skip: number;
}): Promise<TServiceResult<IGroup[]>> => {
  const groups = await Group.find({}, { __v: 0 })
    .limit(paginationData.limit)
    .skip(paginationData.skip);
  return { data: groups, type: "success" };
};

const getGroupByIdService = async (
  groupId: string
): Promise<TServiceResult<IGroup>> => {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = AppError.create(
      "Invalid group id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  return { data: group, type: "success" };
};

const createGroupService = async (groupData: {
  groupName: string;
  createdBy: mongoose.Types.ObjectId;
  isPrivate?: string;
  groupCover?: string;
}): Promise<TServiceResult<IGroup>> => {
  const { groupName, createdBy, isPrivate, groupCover } = groupData;
  const group = new Group({
    groupName,
    createdBy,
    isPrivate: isPrivate === "true" ? true : false,
    groupCover: groupCover || "",
  });

  if (!group) {
    const error = AppError.create(
      "An error occurred during creating the group, please try again later",
      400,
      httpStatusText.FAIL
    );
    return { error, type: "error" };
  }

  group.groupMembers.push(createdBy);
  group.admins.push(createdBy);
  group.save();
  return { data: group, type: "success" };
};

const updateGroupService = async (
  groupId: string,
  userId: string,
  updateData: {
    groupName: string;
    isPrivate?: string;
    groupCover?: string;
  }
): Promise<TServiceResult<IGroup>> => {
  const { groupCover, isPrivate } = updateData;
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);

  if (!group) {
    const error = AppError.create(
      "Invalid group id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userIsGroupOwner = group.createdBy.toString() === userId;
  if (!userIsGroupOwner) {
    const error = AppError.create(
      "Only group owner can delete this group",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (group.isDeleted) {
    const error = AppError.create(
      "This group is deleted, you can't update it",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      $set: {
        ...updateData,
        isPrivate: isPrivate || group.isPrivate,
        groupCover: groupCover || group.groupCover,
      },
    },
    { new: true }
  );

  if (!updatedGroup) {
    const error = AppError.create(
      "An error occurred during updating the group, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  return { data: updatedGroup, type: "success" };
};

const deleteGroupService = async (
  groupId: string,
  userId: string
): Promise<TServiceResult<IGroup>> => {
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);

  if (!group) {
    const error = AppError.create(
      "Invalid group id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userIsGroupOwner = group.createdBy.toString() === userId;
  if (!userIsGroupOwner) {
    const error = AppError.create(
      "Only group owner can delete this group",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  group.isDeleted = true;
  await group.save();
  return { type: "success" };
};

const joinGroupService = async (
  userId: string,
  groupId: string,
  notifications: boolean
): Promise<TServiceResult<IGroup> & { status?: "joined" | "requested" }> => {
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!group) {
    const error = AppError.create(
      "Invalid group id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if the group is deleted
  if (group.isDeleted) {
    const error = AppError.create(
      "The group you are trying to join is deleted",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if the user is already in the group
  const userIsAlreadyInGroup = group.groupMembers.find(
    (member) => member.toString() === userId
  );
  if (userIsAlreadyInGroup) {
    const error = AppError.create(
      "You are already a member in this group",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if the group is private or not
  if (group.isPrivate) {
    // Checking if the user already made a join request
    const userAlreadyRequestedToJoin = group.joinRequests.find(
      (request) => request.toString() === userId
    );
    if (userAlreadyRequestedToJoin) {
      const error = AppError.create(
        "You already made a join request to this group",
        400,
        httpStatusText.ERROR
      );
      return { error, type: "error" };
    }

    group.joinRequests.push(user._id);
    await group.save();
    return { status: "requested", type: "success" };
  } else {
    user.groups.push({
      groupId: group._id,
      notifications: notifications ? notifications : false,
    });
    group.groupMembers.push(user._id);
    await group.save();
    await user.save();
    const addNotificationResult =
      await notificationsServices.addNotificationService(
        "joinGroup",
        group.createdBy,
        { username: user.username, content: group.groupName }
      );
    if (addNotificationResult.type === "error") {
      return { error: addNotificationResult.error!, type: "error" };
    }
    return { status: "joined", type: "success" };
  }
};

const handleJoinRequestsService = async (requestData: {
  groupId: string;
  adminId: string;
  requestingUserId: string;
  status: "accepted" | "declined";
}): Promise<TServiceResult<IGroup>> => {
  const { groupId, adminId, requestingUserId, status } = requestData;
  const group = await Group.findById(groupId);
  const admin = await User.findById(adminId);
  const requestingUser = await User.findById(requestingUserId);

  if (!group) {
    const error = AppError.create(
      "Invalid group id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  if (!admin) {
    const error = AppError.create(
      "Invalid admin id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  if (!requestingUser) {
    const error = AppError.create(
      "Invalid requesting user id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if the requesting user actually made a request
  const userReallyRequestedToJoin = group.joinRequests.find(
    (request) => request.toString() === requestingUserId
  );
  if (!userReallyRequestedToJoin) {
    const error = AppError.create(
      "Invalid join request",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if the user who is handling the request is an admin
  const isHandlingUserAdmin = group.admins.find(
    (admin) => admin.toString() === adminId
  );
  if (!isHandlingUserAdmin) {
    const error = AppError.create(
      "You are not an admin in this group to accept or decline join requests",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  group.joinRequests = group.joinRequests.filter(
    (request) => request.toString() !== requestingUserId
  );
  if (status === "accepted") {
    group.groupMembers.push(requestingUser._id);
    await group.save();
    return { type: "success" };
  } else {
    await group.save();
    return { type: "success" };
  }
};

const leaveGroupService = async (
  userId: string,
  groupId: string
): Promise<TServiceResult<IGroup>> => {
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!group) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  // Checking if the user is really a member in the group
  const isUserMember = group.groupMembers.find(
    (member) => member.toString() === userId
  );
  if (!isUserMember) {
    const error = AppError.create(
      "You are not a member of this group",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  user.groups = user.groups.filter((group) => group.toString() !== groupId);
  group.groupMembers = group.groupMembers.filter(
    (member) => member.toString() !== userId
  );
  await user.save();
  await group.save();
  const addNotificationResult =
    await notificationsServices.addNotificationService(
      "leaveGroup",
      group.createdBy,
      { username: user.username, content: group.groupName }
    );
  if (addNotificationResult.type === "error") {
    return { error: addNotificationResult.error!, type: "error" };
  }
  return { type: "success" };
};

export default {
  getAllGroupsService,
  getGroupByIdService,
  createGroupService,
  updateGroupService,
  deleteGroupService,
  joinGroupService,
  handleJoinRequestsService,
  leaveGroupService,
};