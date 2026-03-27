"use client";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className="fixed bottom-10 right-10 z-200 animate-in fade-in slide-in-from-right-10 duration-300">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl shadow-slate-200 flex items-center gap-3 min-w-75`}
      >
        <div className="bg-white/20 p-1 rounded-lg">
          {type === "success" ? "✓" : "✕"}
        </div>
        <p className="font-bold text-sm tracking-tight">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto hover:opacity-70 transition-opacity text-white/60"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
