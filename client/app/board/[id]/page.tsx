"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import type { Board, Task, User } from "../../../shared/types";
import TaskSidebar from "@/components/TaskSidebar";

const COLUMNS = ["todo", "in-progress", "done"];

export default function BoardDetail() {
  const { id } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [newTasks, setNewTasks] = useState<{ [key: string]: string }>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getInitial = (assignedTo: Task["assignedTo"]) => {
    if (assignedTo && typeof assignedTo === "object" && "email" in assignedTo) {
      return (assignedTo as User).email.charAt(0).toUpperCase();
    }
    return "U";
  };


  useEffect(() => {
    api.get(`/boards/${id}`).then((res) => setBoard(res.data));
  }, [id]);

  const handleUpdateDescription = async (taskId: string, description: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { description });
      setBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, description } : t,
          ),
        };
      });
    } catch (error) {
      console.error("Failed to update description", error);
    }
  };

  const handleCreateTask = async (columnId: string) => {
    const content = newTasks[columnId];
    if (!content?.trim()) return;
    try {
      const res = await api.post("/tasks", { content, columnId, boardId: id });
      setBoard((prev) =>
        prev ? { ...prev, tasks: [...prev.tasks, res.data] } : null,
      );
      setNewTasks({ ...newTasks, [columnId]: "" });
    } catch (error) {
      console.error("Create Failed", error);
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/tasks/${taskId}`);
      setBoard((prev) =>
        prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) } : null,
      );
      if (selectedTask?.id === taskId) setSelectedTask(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !board) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const updatedTasks = Array.from(board.tasks);
    const taskIndex = updatedTasks.findIndex((t) => t.id === draggableId);
    const [movedTask] = updatedTasks.splice(taskIndex, 1);
    movedTask.columnId = destination.droppableId;
    updatedTasks.splice(destination.index, 0, movedTask);
    setBoard({ ...board, tasks: updatedTasks });

    try {
      await api.post(`/tasks/move`, {
        taskId: draggableId,
        newColumnId: destination.droppableId,
        newOrder: destination.index,
      });
    } catch (err) {
      console.error("Failed to sync drag to server", err);
    }
  };

  if (!board) return <div className="p-8 text-slate-500 font-medium">Loading...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 relative">
      <h1 className="text-4xl font-black mb-10 text-slate-800 tracking-tight">{board.title}</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {COLUMNS.map((colId) => (
            <div key={colId} className="w-80 flex flex-col bg-slate-200/50 p-4 rounded-2xl border border-slate-300/30">
              <h3 className="uppercase font-black text-slate-400 text-[10px] tracking-[0.2em] mb-4 px-2">
                {colId.replace("-", " ")}
              </h3>
              <Droppable droppableId={colId}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 min-h-37.5">
                    {board.tasks
                      .filter((t) => t.columnId === colId)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                              className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-200 relative group hover:shadow-md hover:border-blue-400 transition-all cursor-pointer"
                            >
                              <div className="flex justify-between items-start pr-4">
                                <span className="font-semibold text-slate-700 text-sm leading-snug">{task.content}</span>
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center font-bold border border-blue-200 shrink-0">
                                  {getInitial(task.assignedTo)}
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleDeleteTask(e, task.id)}
                                className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-md"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="+ Add a task..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={newTasks[colId] || ""}
                  onChange={(e) => setNewTasks({ ...newTasks, [colId]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTask(colId)}
                />
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedTask(null)}
          />
          <TaskSidebar
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdateDescription={handleUpdateDescription}
          />
        </>
      )}
    </div>
  );
}