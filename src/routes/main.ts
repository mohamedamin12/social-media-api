import authRouter from "./authRouter";
import usersRouter from "./usersRoute";
import groupsRouter from "./groupsRoute";
import postsRouter from "./postsRoute";
import pagesRouter from "./pagesRoute";
import chatsRouter from "./chatsRoute";
import searchRouter from "./searchRoute";

const mainRouter = (app : any) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/groups", groupsRouter);
  app.use("/api/v1/posts", postsRouter);
  app.use("/api/v1/pages", pagesRouter);
  app.use("/api/v1/chats", chatsRouter);
  app.use("/api/v1/search", searchRouter);
};

export default mainRouter;