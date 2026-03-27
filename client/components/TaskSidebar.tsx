"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { TaskSidebarProps } from "@/shared/types";
import CommentList from "./CommentList";

export default function TaskSidebar({
  task,
  currentUser,
  onClose,
  onUpdateDescription,
  onUpdateTask,
  members = [],
}: TaskSidebarProps) {
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [assignedTo, setAssignedTo] = useState<string>(
    typeof task.assignedUser === "string"
      ? task.assignedUser
      : task.assignedUser?.id || "",
  );

  const handleUpdateAssignment = async (userId: string) => {
    const value = userId === "" ? null : userId;
    setAssignedTo(userId);
    try {
      await api.patch(`/tasks/${task.id}`, { assignedTo: value });
      onUpdateTask();
    } catch (error) {
      console.error(error, "Failed to update assignee");
    }
  };

  const handleUpdateDate = async (date: string) => {
    setDueDate(date);
    try {
      await api.patch(`/tasks/${task.id}`, { dueDate: date });
    } catch (err) {
      console.error("Failed to update date", err);
    }
  };

  const getSelectedInitial = () => {
    const member = members?.find((m) => m.userId === assignedTo);
    if (!member) return "U";
    const identifier = member.user.name || member.user.email || "U";
    return identifier.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-112.5 bg-white shadow-2xl z-100 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-100">
      <div className="p-8 border-b border-slate-50 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
              Task Detail
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            {task.content}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        <section>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 block">
            Assigned To
          </label>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl hover:border-blue-200 transition-all">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-black shrink-0 uppercase shadow-sm">
              {getSelectedInitial()}
            </div>
            <select
              value={assignedTo || ""}
              onChange={(e) => handleUpdateAssignment(e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none"
            >
              <option value="">Unassigned</option>
              {members?.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name || member.user.email}
                </option>
              ))}
            </select>
            <span className="text-slate-400 text-xs pr-2">▼</span>
          </div>
        </section>
        <section>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 block">
            Expected Done By
          </label>
          <input
            type="date"
            value={dueDate ? dueDate.split("T")[0] : ""}
            onChange={(e) => handleUpdateDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
          />
        </section>

        <section>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => onUpdateDescription(task.id, description)}
            placeholder="Add a more detailed description..."
            className="w-full h-32 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
          />
        </section>

        <section className="flex flex-col min-h-100">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 block">
            Task Activity
          </label>
          <CommentList
            boardId={task.boardId}
            taskId={task.id}
            currentUser={currentUser}
          />
        </section>
      </div>
    </div>
  );
}
