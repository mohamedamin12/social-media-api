import { User, IUser } from "../models/usersModel";
import { Group, IGroup } from "../models/groupsModel";
import { Page, IPage } from "../models/pagesModel";
import { TServiceResult } from "../types/serviceResult";


const searchService = async (
  type: "users" | "groups" | "pages",
  searchTerm: string,
  paginationData: { limit: number; skip: number }
): Promise<TServiceResult<IUser[] | IGroup[] | IPage[]>> => {
  let searchData = [];
  const { limit, skip } = paginationData;
  switch (type) {
    case "users":
      searchData = await User.find({
        username: { $regex: searchTerm, $options: "i" },
      })
        .select("username profilePicture age gender")
        .limit(limit)
        .skip(skip);
      break;
    case "groups":
      searchData = await Group.find({
        groupName: { $regex: searchTerm, $options: "i" },
      })
        .select("groupName groupCover")
        .limit(limit)
        .skip(skip);
      break;
    case "pages":
      searchData = await Page.find({
        pageName: { $regex: searchTerm, $options: "i" },
      })
        .select("pageName pageCover")
        .limit(limit)
        .skip(skip);
      break;
  }
  return { data: searchData, type: "success" };
};

export default {
  searchService,
};