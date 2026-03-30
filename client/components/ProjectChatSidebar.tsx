"use client";

import { useState, useEffect } from "react";
import {
  Paperclip,
  X,
  ChevronDown,
  ChevronRight,
  FileIcon,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import CommentList from "./CommentList";
import AttachmentModal from "./AttachmentModal";
import AttachmentGallery from "./AttachmentGallery";
import api from "@/lib/api";
import { ProjectChatSidebarProps, Attachment } from "@/shared/types";

export default function ProjectChatSidebar({
  boardId,
  currentUser,
  onClose,
}: ProjectChatSidebarProps) {
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
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-105 animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-112.5 bg-[#1e293b] shadow-[-20px_0_80px_rgba(0,0,0,0.5)] z-110 flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-500 ease-out">
        <div className="absolute top-0 right-0 w-32 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />

        <div className="p-10 pb-8 relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 border border-indigo-400/20">
                <MessageSquare size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">
                  Team Chat
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles size={10} className="text-indigo-400" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    Project Protocol
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 rounded-xl transition-all text-slate-500 border border-slate-800"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="px-10 mb-6 relative z-10">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className={`w-full p-5 flex items-center justify-between rounded-2xl border-2 transition-all ${
              showGallery
                ? "bg-indigo-600/10 border-indigo-500/30 text-white"
                : "bg-[#0f172a]/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-[#0f172a]"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileIcon
                size={14}
                strokeWidth={3}
                className={showGallery ? "text-indigo-400" : "text-slate-600"}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Project Vault ({attachments.length})
              </span>
            </div>
            {showGallery ? (
              <ChevronDown
                size={16}
                strokeWidth={3}
                className="text-indigo-400"
              />
            ) : (
              <ChevronRight
                size={16}
                strokeWidth={3}
                className="text-slate-600"
              />
            )}
          </button>

          {showGallery && (
            <div className="mt-3 p-6 bg-[#0f172a] rounded-4xl border-2 border-slate-800 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
              <AttachmentGallery
                attachments={attachments}
                onDelete={(id) =>
                  setAttachments((prev) => prev.filter((a) => a.id !== id))
                }
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 group"
              >
                <Paperclip
                  size={14}
                  className="group-hover:rotate-12 transition-transform"
                />
                Add To Vault
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col px-10 pb-10 relative z-10">
          <div className="h-px w-full bg-slate-800/50 mb-8" />
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
    </>
  );
}
