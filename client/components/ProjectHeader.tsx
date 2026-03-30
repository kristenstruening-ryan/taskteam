"use client";

import { useState } from "react";
import { MessageSquare, Plus, Calendar } from "lucide-react";
import InviteModal from "./InviteModal";
import type { ProjectHeaderProps } from "../shared/types";

export default function ProjectHeader({
  title,
  members,
  boardId,
  onOpenMembers,
  onOpenChat,
  onOpenMeetingModal,
}: ProjectHeaderProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
      <div className="space-y-8 w-full">
        {/* FIX: Using 'text-current' or explicit dark overrides */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter antialiased text-slate-900 dark:text-white transition-colors duration-300">
          {title}
        </h1>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex -space-x-3 items-center">
            {members.slice(0, 5).map((m) => (
              <button
                key={m.userId}
                onClick={onOpenMembers}
                title={m.user.name || m.user.email}
                className="w-12 h-12 rounded-2xl border-4 border-white dark:border-[#0f172a] bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white shadow-xl hover:-translate-y-1 hover:z-10 transition-all uppercase"
              >
                {(m.user.name || m.user.email || "U").charAt(0).toUpperCase()}
              </button>
            ))}
            {members.length > 5 && (
              <div className="w-12 h-12 rounded-2xl border-4 border-white dark:border-[#0f172a] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                +{members.length - 5}
              </div>
            )}
          </div>

          <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />

          {/* Action Buttons - Now with Dark Mode support */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenMeetingModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            >
              <Calendar size={14} /> Schedule
            </button>

            <button
              onClick={onOpenChat}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-[#1e293b] text-white dark:text-slate-200 border border-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-[#0f172a] transition-all shadow-lg active:scale-95"
            >
              <MessageSquare size={14} /> Team Chat
            </button>

            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-transparent border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all group"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform" />
              Invite
            </button>
          </div>

          {isInviteOpen && (
            <InviteModal
              boardId={boardId}
              onClose={() => setIsInviteOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}