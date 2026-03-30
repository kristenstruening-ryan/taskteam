"use client";

import { useState } from "react";
import api from "@/lib/api";
import { X, FileUp, Loader2 } from "lucide-react";
import type { AttachmentModalProps } from "@/shared/types";

export default function AttachmentModal({
  context,
  onClose,
  onSuccess,
}: AttachmentModalProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: s3Data } = await api.get(
        `/attachments/presigned?fileName=${file.name}&fileType=${file.type}`,
      );

      await fetch(s3Data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const payload = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storageKey: s3Data.key,
        fileUrl: s3Data.fileUrl,
        // DYNAMIC CONTEXT MAPPING:
        boardId: context.type === "board" ? context.id : null,
        taskId: context.type === "task" ? context.id : null,
        commentId: context.type === "chat" ? context.id : null,
      };

      const { data: newAttachment } = await api.post("/attachments", payload);

      onSuccess(newAttachment);
      onClose();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-card rounded-[2.5rem] p-10 w-full max-w-lg shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">

        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-3xl font-black text-foreground tracking-tighter">
              Transmit File
            </h3>
            <div className="flex items-center gap-2.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Uploading to {context.type}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-foreground">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Upload Drop Zone - Glass Readout Style */}
        <label className="group relative flex flex-col items-center justify-center w-full h-56 bg-accent/3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl hover:border-accent hover:bg-accent/5 transition-all cursor-pointer shadow-inner">
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                Uploading...
              </span>
            </div>
          ) : (
            <>
              <div className="p-4 bg-card rounded-2xl text-accent shadow-sm border border-slate-200 dark:border-slate-800 mb-5">
                <FileUp size={28} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-accent">
                Click to browse files
              </span>
              <span className="text-[10px] font-medium text-slate-500 mt-2">
                Maximum upload size: 25MB
              </span>
              <input type="file" className="hidden" onChange={handleFileChange} />
            </>
          )}
        </label>
      </div>
    </div>
  );
}