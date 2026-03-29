"use client";

import { useState } from "react";
import api from "@/lib/api";
import { AttachmentModalProps } from "@/shared/types";

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-black text-slate-800 mb-2">
          Upload Attachment
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Adding a file to this {context.type}.
        </p>

        <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-blue-600 uppercase">
                Uploading...
              </span>
            </div>
          ) : (
            <>
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                📂
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600">
                Click to browse files
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}
        </label>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
