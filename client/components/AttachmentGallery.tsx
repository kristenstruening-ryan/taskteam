"use client";

import React, { useState } from "react";
import {
  FileIcon,
  ImageIcon,
  FileText,
  Archive,
  ExternalLink,
  Download,
  Link as LinkIcon,
  Trash2,
  FileCode,
  Box
} from "lucide-react";
import { AttachmentGalleryProps, Attachment } from "@/shared/types";
import api from "@/lib/api";
import DeleteModal from "@/components/DeleteModal";

export default function AttachmentGallery({
  attachments,
  onDelete,
}: AttachmentGalleryProps) {
  const [fileToDelete, setFileToDelete] = useState<Attachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = (type: string | null) => {
    if (!type) return <FileIcon size={18} />;
    const t = type.toLowerCase();
    if (t.includes("image")) return <ImageIcon size={18} className="text-indigo-400" />;
    if (t.includes("pdf")) return <FileText size={18} className="text-rose-400" />;
    if (t.includes("zip") || t.includes("rar")) return <Archive size={18} className="text-amber-400" />;
    if (t.includes("link") || t.includes("url")) return <LinkIcon size={18} className="text-emerald-400" />;
    if (t.includes("json") || t.includes("javascript") || t.includes("typescript"))
      return <FileCode size={18} className="text-blue-400" />;
    return <Box size={18} className="text-slate-500" />;
  };

  const formatSize = (bytes: string | number | null) => {
    if (!bytes) return "0 KB";
    const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (isNaN(numBytes) || numBytes === 0) return "0 KB";

    const kb = numBytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/attachments/${fileToDelete.id}`);
      onDelete(fileToDelete.id);
      setFileToDelete(null);
    } catch (err) {
      console.error("Transmission Interrupted: Could not delete file", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 mt-8">
      {attachments.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-5 bg-[#1e293b]/40 border-2 border-slate-800/50 rounded-4xl hover:border-indigo-500/30 hover:bg-[#1e293b]/60 transition-all group shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-center gap-5 overflow-hidden relative z-10">
            <div className="w-14 h-14 bg-[#0f172a] rounded-2xl border-2 border-slate-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
              {getFileIcon(file.fileType)}
            </div>

            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-black text-white truncate tracking-tight group-hover:text-indigo-300 transition-colors">
                {file.fileName}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {formatSize(file.fileSize)}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500/50">
                  {file.fileType?.split("/")[1] || "DATA"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Download Transmission"
              className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl border-2 border-transparent hover:border-slate-700 transition-all"
            >
              {file.fileType?.includes("link") ? (
                <ExternalLink size={18} strokeWidth={2.5} />
              ) : (
                <Download size={18} strokeWidth={2.5} />
              )}
            </a>

            <button
              onClick={() => setFileToDelete(file)}
              title="Purge Attachment"
              className="p-3 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border-2 border-transparent hover:border-rose-500/20 transition-all"
            >
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ))}

      {/* Integrated Security Protocol Modal */}
      <DeleteModal
        isOpen={!!fileToDelete}
        title={`Purge "${fileToDelete?.fileName}"?`}
        description="This will permanently remove the attachment from project memory. This action cannot be undone."
        variant="warning"
        confirmText="Confirm Purge"
        onClose={() => setFileToDelete(null)}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}