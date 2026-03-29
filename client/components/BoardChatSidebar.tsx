"use client";

import { useState, useEffect } from "react";
import {
  Paperclip,
  X,
  ChevronDown,
  ChevronRight,
  FileIcon,
} from "lucide-react";
import CommentList from "./CommentList";
import AttachmentModal from "./AttachmentModal";
import AttachmentGallery from "./AttachmentGallery"; // Reuse your component!
import api from "@/lib/api";
import { BoardChatSidebarProps, Attachment } from "@/shared/types";

export default function BoardChatSidebar({
  boardId,
  currentUser,
  onClose,
}: BoardChatSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get(`/attachments/board/${boardId}`);
        setAttachments(res.data);
      } catch (err) {
        console.error("Failed to fetch project files", err);
      }
    };
    fetchFiles();
  }, [boardId]);

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
          <X size={20} />
        </button>
      </div>

      <div className="border-b border-slate-50">
        <button
          onClick={() => setShowGallery(!showGallery)}
          className="w-full px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileIcon size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Project Files ({attachments.length})
            </span>
          </div>
          {showGallery ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {showGallery && (
          <div className="px-8 pb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <AttachmentGallery
              attachments={attachments}
              onDelete={(id) =>
                setAttachments((prev) => prev.filter((a) => a.id !== id))
              }
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Paperclip size={12} /> Add File
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 p-8 overflow-hidden">
        <CommentList boardId={boardId} currentUser={currentUser} />
      </div>

      {isModalOpen && (
        <AttachmentModal
          context={{ type: "board", id: boardId }}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newAtt) => {
            setAttachments((prev) => [...prev, newAtt]);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
