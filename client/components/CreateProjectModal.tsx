"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Rocket, Target, Users, X, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/boards", { title });
      router.push(`/projects/${res.data.id}`);
      onClose();
    } catch (err) {
      console.error("Launch failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-[#1e293b] w-full max-w-lg rounded-[3.5rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-800">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="p-12 relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-5">
              <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-2xl shadow-indigo-500/40 border border-indigo-400/20">
                <Rocket size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  Launch Mission
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1.5">New Project Hub</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center bg-slate-900/50 hover:bg-red-500/20 hover:text-red-400 rounded-2xl transition-all text-slate-500 border border-slate-800"
            >
              <X size={22} strokeWidth={3} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-10">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
                <Target size={14} className="text-indigo-400" /> Project Identity
              </label>
              <input
                autoFocus
                required
                className="w-full px-8 py-6 bg-[#0f172a] border-2 border-slate-800 rounded-4xl focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all text-xl font-bold text-white placeholder:text-slate-700 shadow-inner"
                placeholder="Name your mission..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Tactical Info Box */}
            <div className="p-8 bg-[#0f172a]/50 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-md">
              <div className="flex items-start gap-5">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-inner">
                  <Users size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-white uppercase tracking-wider">Collaboration Ready</h4>
                  <p className="text-[12px] text-slate-500 mt-2 leading-relaxed font-bold">
                    Invite your team and sync your workspace once the project is initialized.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-6 bg-white text-[#0f172a] hover:bg-indigo-50 disabled:opacity-20 rounded-4xl font-black uppercase tracking-[0.25em] text-xs transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-95 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Start Project
                  <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}