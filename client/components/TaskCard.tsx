"use client";

import Image from "next/image";
import { Draggable } from "@hello-pangea/dnd";
import { Paperclip, MessageSquare, X } from "lucide-react";
import type { TaskCardProps, User, Task } from "../shared/types";
import { useState } from "react";

export default function TaskCard({
  task,
  index,
  onClick,
  onDelete,
}: TaskCardProps) {
  const [imageError, setImageError] = useState(false);

  const isUserObject = (user: Task["assignedUser"]): user is User => {
    return typeof user === "object" && user !== null && "email" in user;
  };

  const getInitial = (user: Task["assignedUser"]) => {
    if (isUserObject(user))
      return (user.name || user.email || "?").charAt(0).toUpperCase();
    return "?";
  };

  const imageAttachment = task.attachments?.find(
    (a) =>
      a.fileType?.startsWith("image/") ||
      a.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i),
  );

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group relative mb-4 overflow-hidden rounded-4xl border transition-all cursor-pointer shadow-xl ${
            snapshot.isDragging
              ? "z-50 rotate-2 border-indigo-500 bg-[#1e293b] shadow-2xl scale-105"
              : "border-slate-800 bg-[#1e293b] hover:border-indigo-500/50 hover:shadow-indigo-500/10"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:bg-red-500 hover:border-red-400 group-hover:opacity-100"
          >
            <X size={14} strokeWidth={3} />
          </button>

          {imageAttachment && !imageError ? (
            <div className="relative h-40 w-full overflow-hidden border-b border-slate-800">
              <div className="absolute inset-0 z-10 bg-linear-to-t from-[#1e293b] via-transparent to-transparent opacity-60" />
              <Image
                src={imageAttachment.fileUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="h-2 w-full bg-linear-to-r from-indigo-500/20 via-indigo-500/40 to-indigo-500/20 opacity-20" />
          )}

          <div className="p-6">
            <div className="flex justify-between items-start gap-4 mb-4">
              <h4 className="text-[15px] font-bold leading-snug tracking-tight text-white antialiased group-hover:text-indigo-300 transition-colors">
                {task.content}
              </h4>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-[10px] font-black text-white shadow-lg ring-2 ring-[#1e293b] uppercase">
                  {getInitial(task.assignedUser)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
              <div className="flex items-center gap-4">
                {(task.comments?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-black">
                    <MessageSquare size={14} className="text-indigo-400" />
                    {task.comments?.length}
                  </div>
                )}
                {(task.attachments?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-black">
                    <Paperclip size={14} className="rotate-45 text-slate-500" />
                    {task.attachments?.length}
                  </div>
                )}
              </div>

              <div className="h-1.5 w-8 rounded-full bg-slate-800" />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}