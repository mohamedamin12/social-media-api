import { Post, IPost } from "../models/postsModel";
import { User, IUser } from "../models/usersModel";
import { Group, IGroup } from "../models/groupsModel";
import { Page, IPage } from "../models/pagesModel";
import AppError from "../utils/appError";
import httpStatusText from "../utils/httpStatusText";
import { TServiceResult } from "../types/serviceResult";
import { IReport } from "../types/report";

const checkIfReportIsAlreadyMade = (reportsArr: IReport[], userId: string) => {
  return reportsArr.find((report) => report.reportedBy.toString() === userId);
};

const addReportService = async (
  reportItem: {
    type: "user" | "group" | "page" | "post";
    reportedItemId: string;
  },
  reportData: {
    reason: string;
    reportedBy: string;
  }
): Promise<TServiceResult<IUser | IGroup | IPage | IPost>> => {
  const { type, reportedItemId } = reportItem;
  const { reason, reportedBy } = reportData;
  const user = await User.findById(reportedBy);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  switch (type) {
    case "user":
      const reportedUser = await User.findById(reportedItemId);
      if (!reportedUser) {
        const error = AppError.create(
          "Invalid reported user id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      if (checkIfReportIsAlreadyMade(reportedUser.reports, reportedBy)) {
        const error = AppError.create(
          "You have already reported this user",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      reportedUser.reports.push({ reason, reportedBy: user._id });
      user.madeReports.push({ reportedItemId: reportedUser._id, reason });
      await reportedUser.save();
      await user.save();
      break;
    case "group":
      const reportedGroup = await Group.findById(reportedItemId);
      if (!reportedGroup) {
        const error = AppError.create(
          "Invalid reported group id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      if (checkIfReportIsAlreadyMade(reportedGroup.reports, reportedBy)) {
        const error = AppError.create(
          "You have already reported this group",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      reportedGroup.reports.push({ reason, reportedBy: user._id });
      user.madeReports.push({ reportedItemId: reportedGroup._id, reason });
      await reportedGroup.save();
      await user.save();
      break;
    case "page":
      const reportedPage = await Page.findById(reportedItemId);
      if (!reportedPage) {
        const error = AppError.create(
          "Invalid reported page id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      if (checkIfReportIsAlreadyMade(reportedPage.reports, reportedBy)) {
        const error = AppError.create(
          "You have already reported this page",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      reportedPage.reports.push({ reason, reportedBy: user._id });
      user.madeReports.push({ reportedItemId: reportedPage._id, reason });
      await reportedPage.save();
      await user.save();
      break;
    case "post":
      const reportedPost = await Post.findById(reportedItemId);
      if (!reportedPost) {
        const error = AppError.create(
          "Invalid reported user id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      if (checkIfReportIsAlreadyMade(reportedPost.reports, reportedBy)) {
        const error = AppError.create(
          "You have already reported this post",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      reportedPost.reports.push({ reason, reportedBy: user._id });
      user.madeReports.push({ reportedItemId: reportedPost._id, reason });
      await reportedPost.save();
      await user.save();
      break;
  }

  return { type: "success" };
};

const isUserTheReportOwner = (reportsArr: IReport[], userId: string) => {
  return reportsArr.find((report) => report.reportedBy.toString() === userId);
};

const removeReportService = async (reportInfo: {
  type: "user" | "group" | "page" | "post";
  reportedItemId: string;
  userId: string;
}): Promise<TServiceResult<IUser | IGroup | IPage | IPost>> => {
  const { type, reportedItemId, userId } = reportInfo;
  const user = await User.findById(userId);
  if (!user) {
    const error = AppError.create("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  switch (type) {
    case "user":
      const reportedUser = await User.findById(reportedItemId);
      if (!reportedUser) {
        const error = AppError.create(
          "Invalid reported user id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      if (!isUserTheReportOwner(reportedUser.reports, userId)) {
        const error = AppError.create(
          "You can't remove this report, only the report owner can delete it",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      reportedUser.reports = reportedUser.reports.filter(
        (report) => report.reportedBy.toString() !== userId
      );
      user.madeReports = user.madeReports.filter(
        (report) => report.reportedItemId.toString() !== reportedItemId
      );

      await reportedUser.save();
      await user.save();
      break;
    case "group":
      const reportedGroup = await Group.findById(reportedItemId);
      if (!reportedGroup) {
        const error = AppError.create(
          "Invalid reported group id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      if (!isUserTheReportOwner(reportedGroup.reports, userId)) {
        const error = AppError.create(
          "You can't remove this report, only the report owner can delete it",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      reportedGroup.reports = reportedGroup.reports.filter(
        (report) => report.reportedBy.toString() !== userId
      );
      user.madeReports = user.madeReports.filter(
        (report) => report.reportedItemId.toString() !== reportedItemId
      );

      await reportedGroup.save();
      await user.save();
      break;
    case "page":
      const reportedPage = await Page.findById(reportedItemId);
      if (!reportedPage) {
        const error = AppError.create(
          "Invalid reported page id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      if (!isUserTheReportOwner(reportedPage.reports, userId)) {
        const error = AppError.create(
          "You can't remove this report, only the report owner can delete it",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      reportedPage.reports = reportedPage.reports.filter(
        (report) => report.reportedBy.toString() !== userId
      );
      user.madeReports = user.madeReports.filter(
        (report) => report.reportedItemId.toString() !== reportedItemId
      );

      await reportedPage.save();
      await user.save();
      break;
    case "post":
      const reportedPost = await Post.findById(reportedItemId);
      if (!reportedPost) {
        const error = AppError.create(
          "Invalid reported post id",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      if (!isUserTheReportOwner(reportedPost.reports, userId)) {
        const error = AppError.create(
          "You can't remove this report, only the report owner can delete it",
          400,
          httpStatusText.ERROR
        );
        return { error, type: "error" };
      }

      reportedPost.reports = reportedPost.reports.filter(
        (report) => report.reportedBy.toString() !== userId
      );
      user.madeReports = user.madeReports.filter(
        (report) => report.reportedItemId.toString() !== reportedItemId
      );

      await reportedPost.save();
      await user.save();
      break;
  }

  return { type: "success" };
};

export default {
  addReportService,
  removeReportService,
};