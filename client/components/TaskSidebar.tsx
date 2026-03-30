"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { TaskSidebarProps } from "@/shared/types";
import CommentList from "./CommentList";
import {
  Paperclip,
  X,
  Calendar,
  User,
  AlignLeft,
  Activity,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import AttachmentGallery from "./AttachmentGallery";
import AttachmentModal from "./AttachmentModal";
import Toast from "./Toast";

export default function TaskSidebar({
  task,
  currentUser,
  onClose,
  onUpdateDescription,
  onUpdateTask,
  members = [],
}: TaskSidebarProps) {
  const [description, setDescription] = useState(task.description || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [assignedTo, setAssignedTo] = useState<string>(
    typeof task.assignedUser === "string"
      ? task.assignedUser
      : task.assignedUser?.id || "",
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleUpdateAssignment = async (userId: string) => {
    const value = userId === "" ? null : userId;
    setAssignedTo(userId);
    try {
      await api.patch(`/tasks/${task.id}`, { assignedTo: value });
      onUpdateTask();
    } catch (error) {
      console.error("Failed to update assignee", error);
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

  const handleClaim = async () => {
    // Safety check for TypeScript and UX
    if (!currentUser) {
      setToast({
        message: "Identity not verified. Please log in.",
        type: "error",
      });
      return;
    }

    try {
      await api.patch(`/tasks/${task.id}/assign`, {
        taskId: task.id,
        assigneeId: currentUser.id,
      });
      onUpdateTask();
      setToast({ message: "Unit assigned to your command.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Assignment protocol failed.", type: "error" });
    }
  };

  const getSelectedInitial = () => {
    const member = members?.find((m) => m.userId === assignedTo);
    if (!member) return "?";
    const identifier = member.user.name || member.user.email || "?";
    return identifier.charAt(0).toUpperCase();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#020617]/60 backdrop-blur-sm z-140 animate-in fade-in duration-500"
        onClick={onClose}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="fixed inset-y-0 right-0 w-125 bg-[#1e293b] shadow-[-32px_0_80px_rgba(0,0,0,0.6)] z-sidebar flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-800">
        <div className="absolute top-0 right-0 w-48 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="p-10 border-b border-slate-800/50 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
              Task Detail
            </span>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 rounded-xl transition-all text-slate-500 border border-slate-800"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight tracking-tighter antialiased">
            {task.content}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 custom-scrollbar pb-32">
          <div className="grid grid-cols-2 gap-6">
            <section className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1">
                <User size={12} className="text-indigo-400" /> Assignee
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-slate-800 text-indigo-400 text-[10px] flex items-center justify-center font-black border border-slate-700 shadow-inner uppercase">
                  {getSelectedInitial()}
                </div>
                <select
                  value={assignedTo || ""}
                  onChange={(e) => handleUpdateAssignment(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-slate-800 pl-14 pr-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {members?.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.name || member.user.email.split("@")[0]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-indigo-400 transition-colors"
                />
              </div>
            </section>

            <section className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1">
                <Calendar size={12} className="text-indigo-400" /> Deadline
              </label>
              <input
                type="date"
                value={dueDate ? dueDate.split("T")[0] : ""}
                onChange={(e) => handleUpdateDate(e.target.value)}
                className="w-full bg-[#0f172a] border-2 border-slate-800 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/50 transition-all scheme-dark cursor-pointer"
              />
            </section>
          </div>

          <section className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1">
              <AlignLeft size={12} className="text-indigo-400" /> Objective
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => onUpdateDescription(task.id, description)}
              placeholder="Describe the mission parameters..."
              className="w-full h-40 bg-[#0f172a] border-2 border-slate-800 p-6 rounded-4xl text-sm font-bold text-slate-200 placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all resize-none shadow-inner leading-relaxed"
            />
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                <Paperclip size={12} className="text-indigo-400" /> Assets
              </label>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl border border-indigo-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                Add File
              </button>
            </div>

            <div className="bg-[#0f172a]/50 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-6 shadow-inner">
              <AttachmentGallery
                attachments={attachments}
                onDelete={(id) =>
                  setAttachments((prev) => prev.filter((a) => a.id !== id))
                }
              />
            </div>
          </section>

          <section className="flex flex-col min-h-125 pt-4">
            <div className="h-px w-full bg-slate-800/50 mb-10" />
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-1 mb-6">
              <Activity size={12} className="text-indigo-400" /> Mission Log
            </label>
            <CommentList
              boardId={task.boardId}
              taskId={task.id}
              currentUser={currentUser}
            />
          </section>
        </div>

        {!task.assignedUser && currentUser && (
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-[#1e293b] via-[#1e293b] to-transparent z-20">
            <button
              onClick={handleClaim}
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              <ShieldCheck size={18} className="group-hover:animate-pulse" />
              Claim This Objective
            </button>
          </div>
        )}

        {isModalOpen && (
          <AttachmentModal
            context={{ type: "task", id: task.id }}
            onClose={() => setIsModalOpen(false)}
            onSuccess={(newAtt) => setAttachments((prev) => [...prev, newAtt])}
          />
        )}
      </div>
    </>
  );
}
