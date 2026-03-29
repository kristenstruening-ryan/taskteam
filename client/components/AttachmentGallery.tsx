import React from "react";
import {
  FileIcon,
  ImageIcon,
  FileText,
  Archive,
  ExternalLink,
  Download,
  Link as LinkIcon,
  Trash2, 
} from "lucide-react";
import { AttachmentGalleryProps } from "@/shared/types";
import api from "@/lib/api";

export default function AttachmentGallery({
  attachments,
  onDelete,
}: AttachmentGalleryProps) {

  const getFileIcon = (type: string | null) => {
    if (!type) return <FileIcon size={20} />;
    const t = type.toLowerCase();
    if (t.includes("image"))
      return <ImageIcon size={20} className="text-blue-500" />;
    if (t.includes("pdf"))
      return <FileText size={20} className="text-red-500" />;
    if (t.includes("zip"))
      return <Archive size={20} className="text-orange-500" />;
    if (t.includes("link") || t.includes("url"))
      return <LinkIcon size={20} className="text-gray-800" />;
    return <FileIcon size={20} className="text-gray-500" />;
  };

  const formatSize = (bytes: string | number | null) => {
    if (!bytes) return "";
    const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (isNaN(numBytes) || numBytes === 0) return "";

    const kb = numBytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this attachment?"))
      return;

    try {
      await api.delete(`/attachments/${id}`);
      onDelete(id);
    } catch (err) {
      console.error(err)
      alert("Failed to delete attachment.");
    }
  };

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {attachments.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-white transition-all group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-white rounded border shadow-sm">
              {getFileIcon(file.fileType)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate pr-2">
                {file.fileName}
              </span>
              <span className="text-xs text-gray-400">
                {formatSize(file.fileSize)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
            >
              {file.fileType?.includes("link") ? (
                <ExternalLink size={16} />
              ) : (
                <Download size={16} />
              )}
            </a>

            <button
              onClick={() => handleDelete(file.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}