"use client";
import { useState } from "react";
import type { DeleteModalProps } from "@/shared/types";

export default function DeleteModal({
  isOpen,
  title,
  onClose,
  onConfirm,
  loading,
  variant = "warning",
  description,
  confirmText = "Confirm Delete",
  requireConfirmationText,
}: DeleteModalProps) {
  const [userInput, setUserInput] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setUserInput("");
    onClose();
  };

  const isConfirmDisabled = !!(
    loading ||
    (requireConfirmationText && userInput !== requireConfirmationText)
  );

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 border border-slate-100">
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl mb-6 shadow-sm ${
            variant === "danger"
              ? "bg-red-50 text-red-500"
              : "bg-orange-50 text-orange-500"
          }`}
        >
          {variant === "danger" ? "🚨" : "⚠️"}
        </div>

        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          {variant === "danger" ? "Critical Action" : "Are you sure?"}
        </h3>

        <p className="text-slate-500 mt-4 leading-relaxed font-medium">
          {description || `You are about to permanently delete:`}
          <span className="block text-slate-900 font-bold mt-1 text-lg">
            &quot;{title}&quot;
          </span>
        </p>

        {requireConfirmationText && (
          <div className="mt-8">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block px-1">
              Type{" "}
              <span className="text-slate-900 underline">
                {requireConfirmationText}
              </span>{" "}
              to confirm
            </label>
            <input
              autoFocus
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={requireConfirmationText}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-black text-center tracking-widest uppercase"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            type="button"
            disabled={loading}
            onClick={handleClose}
            className="flex-1 order-2 sm:order-1 px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={onConfirm}
            className={`flex-[1.5] order-1 sm:order-2 px-6 py-4 text-sm font-black uppercase tracking-widest text-white rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/30"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"
            }`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
