import express, { NextFunction, Request, Response } from 'express';
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import connectToDb from './config/connectToDb';
import httpStatusText from "./utils/httpStatusText";
import TGlobalError from "./types/globalErrorType";
import mainRouter from './routes/main';


const app = express();
const server = http.createServer(app);

export const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("chat message", ({ chatId, content, senderId, messageId }) => {
    console.log(chatId, content, messageId);
    socket.to(chatId).emit("chat message", { messageId, content, senderId });
  });
  socket.on("update message", ({ chatId, messageId, content }) => {
    console.log("messageId", messageId);
    console.log("content", content);
    io.to(chatId).emit("update message", { messageId, content });
  });
  socket.on("delete message", ({ chatId, messageId }) => {
    console.log("messageId", messageId);
    io.to(chatId).emit("delete message", messageId);
  });
  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

dotenv.config();
const port = process.env.PORT;

//* Middlewares
app.use(morgan("common"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * Connect to DB
connectToDb();

// Routes
mainRouter(app);

//* Global error handler
app.use(
  (
    error: TGlobalError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    res.status(error.statusCode || 500).json({
      status: error.statusText || httpStatusText.ERROR,
      message: error.message,
      code: error.statusCode || 500,
      data: null,
    });
  }
);

//* Not found routes
// @ts-ignore
app.all("'/{*any}", (req: Request, res: Response) =>
  res.status(404).json({
    status: httpStatusText.ERROR,
    message: "Route not found.",
  })
)

server.listen(port || 5000, () => {
  console.log(`app running on port ${port}`);
});