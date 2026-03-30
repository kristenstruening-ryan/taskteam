"use client";

import { X, UserMinus, ShieldCheck, User } from "lucide-react";
import type { MemberSidebarProps } from "@/shared/types";

export default function MemberSidebar({
  isOpen,
  onClose,
  members,
  onRemoveMember,
  isOwner,
  currentUserId,
}: MemberSidebarProps) {
  const getInitial = (name?: string | null, email?: string) => {
    const identifier = name || email || "?";
    return identifier.charAt(0).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-140 animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-96 bg-[#1e293b] shadow-[-20px_0_80px_rgba(0,0,0,0.5)] z-sidebar p-10 flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-500 ease-out">
        <div className="absolute top-0 right-0 w-32 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />

        <div className="flex justify-between items-start mb-12 relative z-10">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              Team
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 rounded-2xl transition-all text-slate-500 border border-slate-800 group"
          >
            <X size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2 relative z-10">
          {members.map((member) => {
            const isMe = member.userId === currentUserId;
            return (
              <div
                key={member.userId}
                className={`flex items-center justify-between p-4 rounded-3xl border transition-all group ${
                  isMe
                    ? "bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                    : "bg-[#0f172a]/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border-2 shadow-lg uppercase shrink-0 ${
                    isMe ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    {getInitial(member.user.name, member.user.email)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white truncate tracking-tight">
                        {member.user.name || member.user.email.split('@')[0]}
                      </p>
                      {member.role === 'admin' && <ShieldCheck size={12} className="text-indigo-400 shrink-0" />}
                      {isMe && <span className="text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">You</span>}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                {isOwner && !isMe && (
                  <button
                    onClick={() => onRemoveMember(member.userId)}
                    className="opacity-0 group-hover:opacity-100 w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                    title="Remove member"
                  >
                    <UserMinus size={18} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/50 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-500" />
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
              {members.length} {members.length === 1 ? "Collaborator" : "Collaborators"}
            </p>
          </div>
          <div className="h-1.5 w-12 rounded-full bg-slate-800" />
        </div>
      </div>
    </>
  );
}