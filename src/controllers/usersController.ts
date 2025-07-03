import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import usersServices from "../services/usersServices";
import followsServices from "../services/followsServices";
import friendsServices from "../services/friendsServices";
import httpStatusText from "../utils/httpStatusText";
import { validationResult } from "express-validator";
import AppError from "../utils/appError";

const getAllUsers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await usersServices.getAllUsersService();
    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, length: users.length, data: { users } });
  }
);

const getUserById = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const user = await usersServices.getUserByIdService(userId);
    if (user.type === "error") {
      return next(user.error);
    } else {
      return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { user } });
    }
  }
);

const createUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const uploadedImage = req.file?.path;

    const userData = {
      ...req.body,
      profilePicture: uploadedImage,
    };

    const userResult = await usersServices.createUserService(userData);
    if (userResult.type === "error") {
      return next(userResult.error);
    } else {
      return res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { user: userResult.data, token: userResult.token },
      });
    }
  }
);


const updateUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const profilePicture = req.file?.path;

    const updateUserResult = await usersServices.updateUserService(userId, {
      ...req.body,
      profilePicture,
    });

    if (updateUserResult.type === "error") {
      return next(updateUserResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { user: updateUserResult.data },
      });
    }
  }
);

const deleteUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    console.log(userId);
    const deleteResult = await usersServices.deleteUserService(userId);
    if (deleteResult.type === "error") {
      return next(deleteResult.error);
    }
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "User deleted successfully" },
    });
  }
);

const addFriendRequest = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { senderId } = req.params;
    const { recipientId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const sendingFriendRequestResult =
      await friendsServices.addFriendRequestService(senderId, recipientId);
    if (sendingFriendRequestResult.type === "error") {
      return next(sendingFriendRequestResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Friend request sent successfully" },
      });
    }
  }
);

const updateFriendRequestStatusService = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { senderId, newStatus } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const updatedFriendRequestStatusResult =
      await friendsServices.updateFriendRequestStatusService(userId, {
        sender: senderId,
        status: newStatus,
      });
    if (updatedFriendRequestStatusResult.type === "error") {
      return next(updatedFriendRequestStatusResult.error);
    } else {
      if (newStatus === "accepted") {
        return res.status(200).json({
          status: httpStatusText.SUCCESS,
          data: { message: "Friend request accepted" },
        });
      } else {
        return res.status(200).json({
          status: httpStatusText.SUCCESS,
          data: { message: "Friend request declined" },
        });
      }
    }
  }
);

const addToBlockList = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { userToBlockId } = req.body;
    const addToBlockListResult = await friendsServices.addToBlockListService(
      userId,
      userToBlockId
    );
    if (addToBlockListResult.type === "error") {
      return next(addToBlockListResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You have successfully blocked this user" },
      });
    }
  }
);

const removeFromBlockList = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { blockedUserId } = req.body;
    const addToBlockListResult = await friendsServices.removeFromBlockListService(
      userId,
      blockedUserId
    );
    if (addToBlockListResult.type === "error") {
      return next(addToBlockListResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You have successfully unblocked this user" },
      });
    }
  }
);

const joinGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {}
);

const leaveGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {}
);

const addFollowedUsers = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { followedUserId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const addFollowedUserResult = await followsServices.addFollowedUserService(
      userId,
      followedUserId
    );
    if (addFollowedUserResult.type === "error") {
      return next(addFollowedUserResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You are now following this user" },
      });
    }
  }
);

const removeFollowedUsers = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { followedUserId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = AppError.create(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const removeFollowedUserResult =
      await followsServices.removeFollowedUserService(userId, followedUserId);
    if (removeFollowedUserResult.type === "error") {
      return next(removeFollowedUserResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You are not following this user anymore" },
      });
    }
  }
);

const addFollowedPages = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {}
);


export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addFriendRequest,
  updateFriendRequestStatusService,
  addToBlockList,
  removeFromBlockList,
  joinGroup,
  leaveGroup,
  addFollowedUsers,
  removeFollowedUsers,
  addFollowedPages,
};

