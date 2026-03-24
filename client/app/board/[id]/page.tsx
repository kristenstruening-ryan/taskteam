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
import type { Board } from "../../../shared/types";

const COLUMNS = ["todo", "in-progress", "done"];

export default function BoardDetail() {
  const { id } = useParams();
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    api.get(`/boards/${id}`).then((res) => setBoard(res.data));
  }, [id]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || !board) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const updatedTasks = Array.from(board.tasks);
    const [movedTask] = updatedTasks.splice(
      updatedTasks.findIndex((t) => t.id === draggableId),
      1,
    );
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

  if (!board) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">{board.title}</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6">
          {COLUMNS.map((colId) => (
            <div key={colId} className="w-80 flex flex-col">
              <h3 className="uppercase font-bold text-gray-500 mb-4 px-2">
                {colId}
              </h3>

              <Droppable droppableId={colId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-200 p-4 rounded-xl min-h-125 shadow-inner"
                  >
                    {board.tasks
                      .filter((t) => t.columnId === colId)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 rounded-lg shadow-sm mb-3 border border-gray-200"
                            >
                              {task.content}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
