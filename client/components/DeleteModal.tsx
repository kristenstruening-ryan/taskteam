"use client";
import type { DeleteModalProps } from "@/shared/types";

export default function DeleteModal({
  isOpen,
  title,
  onClose,
  onConfirm,
  loading,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-2xl mb-6 shadow-sm">
          ⚠️
        </div>

        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          Delete Board?
        </h3>

        <p className="text-slate-500 mt-4 leading-relaxed font-medium">
          You are about to permanently delete
          <span className="block text-slate-900 font-bold mt-1 text-lg">
            &quot;{title}&quot;
          </span>
          All tasks, comments, and project data will be lost forever. This
          action cannot be undone.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            disabled={loading}
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
          >
            Go Back
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            className="flex-[1.5] order-1 sm:order-2 px-6 py-4 text-sm font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 rounded-2xl shadow-xl shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
