import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { sql } from "drizzle-orm";
import { db } from "./db";

import rootRouter from "./routes";

import { registerTaskHandlers } from "./sockets/taskHandler";
import { AuthService } from "./services/authService";
import { errorHandler } from "./middleware/errorMiddleware";

export const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.get("/health", async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api", rootRouter);
app.use(errorHandler);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const userId = AuthService.verifyToken(token);
    (socket as any).userId = userId;

    next();
  } catch (error) {
    console.error("Socket Auth Error:", (error as Error).message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket as any).userId;
  console.log(`User connected: ${userId}`);

  registerTaskHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
  });
});

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
