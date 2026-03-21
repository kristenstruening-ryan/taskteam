import { Server, Socket } from "socket.io";
import { TaskService } from "../services/taskService";

export const registerTaskHandlers = (io: Server, socket: Socket) => {
  socket.on("move-task", async (data) => {
    try {
      const userId = (socket as any).userId;

      if (!userId) {
        console.error("Socket attempt without userId");
        return;
      }

      const updatedTask = await TaskService.moveTask(
        data.taskId,
        data.newColumnId,
        data.newOrder,
        userId,
      );

      socket.broadcast.emit("task-moved", updatedTask);
    } catch (error) {
      console.error("Socket move-task error:", error);
      socket.emit("error", { message: "Failed to move task" });
    }
  });
};
