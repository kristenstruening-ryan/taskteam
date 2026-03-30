"use client";

import { useState } from "react";
import api from "@/lib/api";
import { X, Video, Calendar, AlignLeft, Loader2, Sparkles, Clock } from "lucide-react";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onSuccess: () => void;
}

export default function MeetingCreationModal({
  isOpen,
  onClose,
  boardId,
  onSuccess,
}: MeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    meetingLink: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/meetings", { ...formData, boardId });
      onSuccess();
      onClose();
      setFormData({
        title: "",
        startTime: "",
        meetingLink: "",
        description: "",
      });
    } catch (err) {
      console.error("Failed to schedule meeting", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-[#1e293b] w-full max-w-lg rounded-[3.5rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-800">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="p-12 relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-5">
              <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-2xl shadow-indigo-500/40 border border-indigo-400/20">
                <Calendar size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  Schedule Sync
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1.5">Coordinate the team</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center bg-slate-900/50 hover:bg-red-500/20 hover:text-red-400 rounded-2xl transition-all text-slate-500 border border-slate-800"
            >
              <X size={22} strokeWidth={3} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2 block">
                Meeting Identity
              </label>
              <input
                required
                autoFocus
                className="w-full px-8 py-6 bg-[#0f172a] border-2 border-slate-800 rounded-4xl text-lg font-bold text-white outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner placeholder:text-slate-700"
                placeholder="Name the sync..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
                  <Clock size={14} className="text-indigo-400" /> Start Time
                </label>
                <input
                  required
                  type="datetime-local"
                  className="w-full px-6 py-5 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/50 transition-all scheme-dark"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
                  <Video size={14} className="text-indigo-400" /> Access Link
                </label>
                <input
                  className="w-full px-6 py-5 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                  placeholder="Zoom / Meet"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
                <AlignLeft size={14} className="text-indigo-400" /> Strategic Agenda
              </label>
              <textarea
                rows={3}
                className="w-full px-8 py-6 bg-[#0f172a] border-2 border-slate-800 rounded-4xl text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-700 shadow-inner"
                placeholder="Outline the objectives..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="w-full py-6 bg-white text-[#0f172a] hover:bg-indigo-50 disabled:opacity-20 rounded-4xl font-black uppercase tracking-[0.25em] text-xs transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-95 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Schedule Sync
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}