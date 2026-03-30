"use client";
import { useState } from "react";
import { AlertTriangle, ShieldAlert, X, Loader2 } from "lucide-react";
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

  const isDanger = variant === "danger";
  const isConfirmDisabled = !!(
    loading ||
    (requireConfirmationText && userInput !== requireConfirmationText)
  );

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isConfirmDisabled) {
      onConfirm();
      setUserInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={handleClose} />

      <form
        onSubmit={handleSubmit}
        className="relative bg-[#1e293b] rounded-[3.5rem] p-12 w-full max-w-lg shadow-[0_32px_80px_-15px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 border border-slate-800 overflow-hidden"
      >
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 blur-[100px] pointer-events-none ${isDanger ? "bg-red-500/10" : "bg-orange-500/10"}`}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div
              className={`w-20 h-20 rounded-4xl flex items-center justify-center shadow-2xl border-2 transition-all duration-500 ${
                isDanger
                  ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10"
                  : "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10"
              }`}
            >
              {isDanger ? (
                <ShieldAlert size={36} strokeWidth={2.5} />
              ) : (
                <AlertTriangle size={36} strokeWidth={2.5} />
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-12 h-12 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 rounded-2xl transition-all text-slate-500 border border-slate-800"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <h3 className="text-4xl font-black text-white tracking-tighter mb-4">
            {isDanger ? "Critical Action" : "Are you sure?"}
          </h3>

          <div className="space-y-2 mb-10">
            <p className="text-slate-500 text-[13px] font-bold leading-relaxed">
              {description || `You are about to permanently delete:`}
            </p>
            <div className="px-4 py-2 bg-[#0f172a] border border-slate-800 rounded-xl inline-block max-w-full">
              <span className="text-indigo-400 font-black text-lg tracking-tight antialiased truncate block">
                &quot;{title}&quot;
              </span>
            </div>
          </div>

          {requireConfirmationText && (
            <div className="mb-10 p-6 bg-[#0f172a]/50 border border-slate-800/50 rounded-4xl">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 block px-1 text-center">
                Type{" "}
                <span className="text-white underline decoration-red-500 decoration-2 underline-offset-4 font-mono">
                  {requireConfirmationText}
                </span>{" "}
                to authorize
              </label>
              <input
                autoFocus
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                autoComplete="off"
                placeholder="Verify identity..."
                className="w-full bg-[#0f172a] border-2 border-slate-800 p-6 rounded-2xl text-white placeholder:text-slate-700 outline-none focus:border-red-500/50 focus:ring-8 focus:ring-red-500/5 transition-all font-black text-center tracking-[0.2em] uppercase text-sm"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-slate-800 rounded-4xl border border-transparent hover:border-slate-700 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isConfirmDisabled}
              className={`flex-[1.8] order-1 sm:order-2 px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white rounded-4xl shadow-2xl transition-all active:scale-95 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed ${
                isDanger
                  ? "bg-red-600 hover:bg-red-500 shadow-red-500/25"
                  : "bg-orange-500 hover:bg-orange-400 shadow-orange-500/25"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Purging...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
