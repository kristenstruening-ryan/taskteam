import { Server, Socket } from "socket.io";
import { TaskService } from "../services/taskService";

export const registerTaskHandlers = (io: Server, socket: Socket) => {
  const userId = (socket as any).userId;

  socket.on(
    "task:create",
    async (data: { content: string; columnId: string; boardId: string }) => {
      try {
        const newTask = await TaskService.createTask({
          content: data.content,
          columnId: data.columnId,
          boardId: data.boardId,
          userId: userId,
        });

        io.to(data.boardId).emit("task:created", newTask);
      } catch (error) {
        console.error("Socket Task Create Error:", error);
        socket.emit("error", { message: "Failed to create task" });
      }
    },
  );

  socket.on(
    "task:move",
    async (data: {
      taskId: string;
      newColumnId: string;
      newOrder: number;
      boardId: string;
    }) => {
      try {
        const updatedTask = await TaskService.moveTask(
          data.taskId,
          data.newColumnId,
          data.newOrder,
          userId,
        );

        io.to(data.boardId).emit("task:moved", updatedTask);
      } catch (error) {
        console.error("Socket Task Move Error:", error);
        socket.emit("error", { message: "Failed to move task" });
      }
    },
  );

  socket.on("board:join", (boardId: string) => {
    socket.join(boardId);
    console.log(`User ${userId} joined board: ${boardId}`);
  });
};
