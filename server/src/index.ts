import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "./utils/authUtils";
import taskRoutes from "./routes/taskRoutes";
import authRoutes from "./routes/authRoutes";
import { registerTaskHandlers } from "./sockets/taskHandler";

export const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Express Middleware
app.use(express.json());

// REST Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const userId = verifyToken(token);

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
