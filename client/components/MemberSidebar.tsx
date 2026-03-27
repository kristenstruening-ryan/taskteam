"use client";

import type { MemberSidebarProps } from "@/shared/types";

export default function MemberSidebar({
  isOpen,
  onClose,
  members,
  onRemoveMember,
  isOwner,
}: MemberSidebarProps) {
  const getInitial = (name?: string | null, email?: string) => {
    const identifier = name || email || "U";
    return identifier.charAt(0).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.2)] z-150 p-8 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-100">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Team
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 font-bold"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white uppercase">
                {getInitial(member.user.name, member.user.email)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {member.user.name || "User"}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  {member.user.email}
                </p>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={() => onRemoveMember(member.userId)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all text-xs font-black uppercase tracking-widest"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100">
        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
          {members.length}{" "}
          {members.length === 1 ? "Collaborator" : "Collaborators"}
        </p>
      </div>
    </div>
  );
}