"use client";
import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div className="fixed bottom-10 right-10 z-1000 animate-in fade-in slide-in-from-bottom-10 duration-500 ease-out">
      <div
        className={`relative overflow-hidden group min-w-[320px] p-0.5 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
          isSuccess
            ? "bg-linear-to-r from-emerald-500/50 to-emerald-500/10"
            : "bg-linear-to-r from-rose-500/50 to-rose-500/10"
        }`}
      >
        <div className="bg-[#0f172a] rounded-[1.9rem] px-6 py-5 flex items-center gap-4 border border-white/5 backdrop-blur-3xl">
          <div
            className={`shrink-0 p-2 rounded-xl border-2 shadow-lg transition-transform group-hover:scale-110 ${
              isSuccess
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={18} strokeWidth={3} />
            ) : (
              <AlertCircle size={18} strokeWidth={3} />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span
              className={`text-[9px] font-black uppercase tracking-[0.3em] mb-0.5 ${
                isSuccess ? "text-emerald-500/70" : "text-rose-500/70"
              }`}
            >
              {isSuccess ? "System Success" : "Protocol Error"}
            </span>
            <p className="font-bold text-[13px] text-white tracking-tight truncate pr-4 leading-tight antialiased">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all border border-white/5"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        <div
          className={`absolute -bottom-4 -right-4 w-24 h-24 blur-2xl opacity-20 pointer-events-none transition-colors ${
            isSuccess ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />
      </div>
    </div>
  );
}
