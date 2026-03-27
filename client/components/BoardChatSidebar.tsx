"use client";

import CommentList from "./CommentList";
import type { User } from "@/shared/types";

interface Props {
  boardId: string;
  currentUser: User | null;
  onClose: () => void;
}

export default function BoardChatSidebar({
  boardId,
  currentUser,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-y-0 right-0 w-112.5 bg-white shadow-2xl z-110 flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            Team Chat
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            General Project Discussion
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 p-8 overflow-hidden">
        <CommentList boardId={boardId} currentUser={currentUser} />
      </div>
    </div>
  );
}
