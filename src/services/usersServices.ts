import mongoose, { UpdateWriteOpResult } from "mongoose";
import {
  User,
  IUser,
  IFriendRequest,
  IUserGroup,
  INotification,
} from "../models/usersModel";
import bcrypt from "bcrypt";
import { TServiceResult } from "../types/serviceResult";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import generateJwt from "../utils/generateJwt";


const getAllUsersService = async (): Promise<IUser[]> => {
  const users = await User.find({}, { __v: 0 });
  return users;
};

const getUserByIdService = async (
  userId: string
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId, { password: 0, __v: 0 });
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { data: user, type: "success" };
};

const createUserService = async (
  userData: Partial<IUser>
): Promise<TServiceResult<IUser> & { token: string }> => {
  const { username, email, role, password } = userData;
  const hashedPassword = bcrypt.hashSync(password!, 10);
  userData.password = hashedPassword;
  const user = new User(userData);
  await user.save();
  const token = await generateJwt({
    id: user._id,
    username,
    email,
    role,
  });
  return { data: user, token, type: "success" };
};

const updateUserService = async (
  userId: string,
  updateData: {
    username?: string;
    password?: string;
    email?: string;
    gender?: number;
    age?: string;
    profilePicture?: string;
  }
): Promise<TServiceResult<IUser>> => {
  const { profilePicture, password } = updateData;
  const user = await User.findById(userId);

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  let hashedPassword;

  if (password) {
    hashedPassword = bcrypt.hashSync(password, 10);
  }
  console.log(updateData);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...updateData,
        profilePicture: profilePicture || user.profilePicture,
        password: hashedPassword || user.password,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    const error = AppError.create(
      "An error occurred during updating the user, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  return { data: updatedUser, type: "success" };
};

const deleteUserService = async (
  userId: string
): Promise<TServiceResult<IUser>> => {
  const deletedUser = await User.deleteOne({ userId });
  if (!deletedUser.deletedCount) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { type: "success" };
};

const addFriendRequestService = async (
  senderId: string,
  recipientId: string
): Promise<TServiceResult<IUser>> => {
  const sender = await User.findById(senderId);
  const recipient = await User.findById(recipientId);

  if (!sender) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (!recipient) {
    const error = AppError.create(
      "Invalid friend request recipient id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if the recipient already sent a request to the sender
  const recipientAlreadySentRequest = sender.friendRequests.find(
    (request) => request.sender.toString() === recipientId
  );
  if (recipientAlreadySentRequest) {
    const error = AppError.create(
      "The use you are trying to send a friend request to already sent you a friend request, check your friend requests box",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if any of the users blocked the other
  const isUserBlocked = recipient.blockList.find(
    (blocked) => blocked.toString() === senderId
  );
  const senderBlockedTheRecipient = sender.blockList.find(
    (blocked) => blocked.toString() === recipientId
  );

  if (isUserBlocked) {
    const error = AppError.create(
      "You can't send a friend request to this user",
      400,
      httpStatusText.FAIL
    );
    return { error, type: "error" };
  }
  if (senderBlockedTheRecipient) {
    const error = AppError.create(
      "You have to unblock this user first to send him a friend request",
      400,
      httpStatusText.FAIL
    );
    return { error, type: "error" };
  }

  if (sender.friendList.length + sender.friendRequests.length >= 500) {
    const error = AppError.create(
      "You can't send a friend request to this user as your friend list is full",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (recipient.friendList.length + recipient.friendRequests.length >= 500) {
    const error = AppError.create(
      "The user you are trying to send a friend request to has a full friend list",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const requestAlreadyExist = recipient.friendRequests.findIndex(
    (request) => request.sender.toString() === senderId
  );
  if (requestAlreadyExist !== -1) {
    const requestAlreadyAccepted =
      recipient.friendRequests[requestAlreadyExist].status === "accepted";
    if (requestAlreadyAccepted) {
      const error = AppError.create(
        "You are already a friend to this user",
        400,
        httpStatusText.ERROR
      );
      return { error, type: "error" };
    }
    const error = AppError.create(
      "You already sent a friend request to this user",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  sender.sentFriendRequests.push({ sentTo: recipient._id, status: "pending" });
  recipient.friendRequests.push({ sender: sender._id, status: "pending" });
  await sender.save();
  await recipient.save();
  return { type: "success" };
};

const updateFriendRequestStatusService = async (
  recipientId: string,
  friendRequest: IFriendRequest
): Promise<TServiceResult<IUser>> => {
  const recipient = await User.findById(recipientId);
  const sender = await User.findById(friendRequest.sender);

  if (!recipient) {
    const error = AppError.create(
      "Invalid friend request recipient id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (!sender) {
    const error = AppError.create(
      "Invalid friend request sender id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const currentFriendRequestIndex = recipient.friendRequests.findIndex(
    (request) => request.sender.toString() === friendRequest.sender.toString()
  );
  const currentSentFriendRequestIndex = sender.sentFriendRequests.findIndex(
    (sentRequest) => sentRequest.sentTo.toString() === recipientId
  );

  // Checking if the request is already accepted or declined
  const currentFriendRequestStatus =
    sender.sentFriendRequests[currentSentFriendRequestIndex].status;
  if (currentFriendRequestStatus === "accepted") {
    const error = AppError.create(
      "This request is already accepted",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  } else if (currentFriendRequestStatus === "declined") {
    const error = AppError.create(
      "This request is already declined",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (friendRequest.status === "accepted") {
    recipient.friendRequests[currentFriendRequestIndex].status = "accepted";
    sender.sentFriendRequests[currentSentFriendRequestIndex].status =
      "accepted";

    recipient.friendList.push(friendRequest.sender);
    sender.friendList.push(recipient._id);
  } else {
    recipient.friendRequests[currentFriendRequestIndex].status = "declined";
    sender.sentFriendRequests[currentSentFriendRequestIndex].status =
      "declined";
  }

  await recipient.save();
  await sender.save();
  return { type: "success" };
};

const addToBlockListService = async (
  userId: string,
  blockedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  const blockedUser = await User.findById(blockedUserId);

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (!blockedUser) {
    const error = AppError.create(
      "Invalid user id to be blocked",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  user.blockList.push(blockedUserId);

  const userToBlockIsFriend = user.friendList.find(
    (friend) => friend.toString() === blockedUserId.toString()
  );
  if (userToBlockIsFriend) {
    user.friendList = user.friendList.filter(
      (friend) => friend.toString() !== blockedUserId.toString()
    );

    blockedUser.friendList = blockedUser.friendList.filter(
      (friend) => friend.toString() !== userId
    );

    // Checking who sent the request to the other to remove the requests from both users
    // This is for the case of unblock and sending friend requests again
    const blockedUserSentTheRequest = blockedUser.sentFriendRequests.findIndex(
      (sentRequest) => sentRequest.sentTo.toString() === userId
    );
    if (blockedUserSentTheRequest !== -1) {
      blockedUser.sentFriendRequests = blockedUser.sentFriendRequests.filter(
        (sentRequest) => sentRequest.sentTo.toString() !== userId
      );
      user.friendRequests = user.friendRequests.filter(
        (request) => request.sender.toString() !== blockedUserId.toString()
      );
    } else {
      blockedUser.friendRequests = blockedUser.friendRequests.filter(
        (request) => request.sender.toString() !== userId
      );
      user.sentFriendRequests = user.sentFriendRequests.filter(
        (sentRequest) =>
          sentRequest.sentTo.toString() !== blockedUserId.toString()
      );
    }
    await blockedUser.save();
  }

  await user.save();
  return { type: "success" };
};

const removeFromBlockListService = async (
  userId: string,
  blockedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const isUserActullayblocked = user.blockList.findIndex(
    (blockedUser) => blockedUser.toString() === blockedUserId.toString()
  );

  if (isUserActullayblocked !== -1) {
    user.blockList.splice(isUserActullayblocked, 1);
  } else {
    const error = AppError.create(
      "This user is not in your block list",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  user.blockList = user.blockList.filter(
    (blockedUser) => blockedUser.toString() !== blockedUserId.toString()
  );
  await user.save();
  return { type: "success" };
};

const joinGroupService = async (
  userId: string,
  groupData: IUserGroup
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.groups.push({
    groupId: groupData.groupId,
    notifications: groupData.notifications,
  });
  await user.save();
  return { data: user, type: "success" };
};

const leaveGroupService = async (
  userId: string,
  groupId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.groups.filter((group) => group.groupId !== groupId);
  await user.save();
  return { data: user, type: "success" };
};

const addFollowedUserService = async (
  userId: string,
  followedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  const followedUser = await User.findById(followedUserId);

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!followedUser) {
    const error = AppError.create(
      "Invalid followed user id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const followAlreadyExists = user.followedUsers.includes(followedUserId);
  if (followAlreadyExists) {
    const error = AppError.create(
      "You are already following this user",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  user.followedUsers.push(followedUserId);
  followedUser.followers.push(user._id);
  await user.save();
  await followedUser.save();
  return { data: user, type: "success" };
};

const removeFollowedUserService = async (
  userId: string,
  followedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  const followedUser = await User.findById(followedUserId);

  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!followedUser) {
    const error = AppError.create(
      "Invalid followed user id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const userIsFollowingTheFollowedUser = user.followedUsers.find(
    (followed) => followed.toString() === followedUserId.toString()
  );
  if (!userIsFollowingTheFollowedUser) {
    const error = AppError.create(
      "You can't unfollow this user as you didn't follow him before",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  user.followedUsers = user.followedUsers.filter(
    (user) => user.toString() !== followedUserId.toString()
  );
  followedUser.followers = followedUser.followers.filter(
    (user) => user.toString() !== userId
  );

  await user.save();
  followedUser.save();
  return { type: "success" };
};

const addFollowedPagesService = async (
  userId: string,
  followedPageId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  const followAlreadyExists = user.followedPages.includes(followedPageId);
  if (followAlreadyExists) {
    const error = AppError.create(
      "You are already following this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  user.followedPages.push(followedPageId);
  await user.save();
  return { data: user, type: "success" };
};

const removeFollowedPagesService = async (
  userId: string,
  followedPageId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.followedUsers.filter((page) => page._id !== followedPageId);
  await user.save();
  return { data: user, type: "success" };
};

const addNotificationsService = async (
  userId: string,
  notificationData: INotification
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.notifications.push(notificationData);
  await user.save();
  return { data: user, type: "success" };
};

const markNotificationAsReadService = async (
  userId: string,
  notificationId: mongoose.Types.ObjectId
) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  const notificationToUpdate = user.notifications.find(
    (notification) => (notification._id as unknown) === notificationId
  );
  if (!notificationToUpdate) {
    const error = AppError.create(
      "Invalid notification id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  notificationToUpdate.read = true;
  await user.save();
  return { data: user, type: "success" };
};

const removeNotificationsService = async (
  userId: string,
  notificationId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.notifications.filter(
    (notification) => (notification._id as unknown) !== notificationId
  );
  await user.save();
  return { data: user, type: "success" };
};

export default {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
  addFriendRequestService,
  updateFriendRequestStatusService,
  addToBlockListService,
  removeFromBlockListService,
  joinGroupService,
  leaveGroupService,
  addFollowedUserService,
  removeFollowedUserService,
  addFollowedPagesService,
  removeFollowedPagesService,
  addNotificationsService,
  markNotificationAsReadService,
  removeNotificationsService,
};