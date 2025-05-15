import { Router } from "express";
import { search } from "../controllers/searchController";
import searchValidation from "../utils/validations/searchValidation";

const searchRouter = Router();

searchRouter.route("/:searchTerm").post(searchValidation(), search);

export default searchRouter;