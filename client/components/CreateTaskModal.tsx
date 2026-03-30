"use client";

import { useState } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import type { CreateTaskModalProps } from "@/shared/types";

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const [content, setContent] = useState("");
  const [columnId, setColumnId] = useState("todo");

  if (!isOpen) return null;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onCreate(columnId, content);
    setContent("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#1e293b] w-full max-w-lg rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 border border-slate-800 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="flex justify-between items-start mb-10 relative z-10">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              New Task
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Sparkles size={12} className="text-indigo-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Define the objective
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-slate-900/50 hover:bg-red-500/20 hover:text-red-400 rounded-2xl transition-all text-slate-500 border border-slate-800"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
              Description
            </label>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's the mission?"
              className="w-full p-6 bg-[#0f172a] border-2 border-slate-800 rounded-4xl text-sm font-bold text-white outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all min-h-40 resize-none placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
              Placement
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["todo", "in-progress", "done"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setColumnId(id)}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                    columnId === id
                      ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                      : "bg-[#0f172a] border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  {id.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-6 bg-white text-[#0f172a] rounded-4xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-indigo-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 mt-4"
          >
            <Plus size={20} strokeWidth={4} /> Create Task
          </button>
        </form>
      </div>
    </div>
  );
}
