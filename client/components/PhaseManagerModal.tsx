"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Calendar,
  CheckCircle2,
  Trophy,
  Target,
  Trash2,
} from "lucide-react";
import api from "@/lib/api";
import type { PhaseModalProps, PhaseWithTasks } from "@/shared/types";
import { useSuccess } from "@/hooks/useSuccess";
import DeleteModal from "@/components/DeleteModal";

export default function PhaseManagerModal({
  isOpen,
  onClose,
  boardId,
  phases,
  onRefresh,
}: PhaseModalProps) {
  const { fire } = useSuccess();
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // State for deletion
  const [phaseToDelete, setPhaseToDelete] = useState<PhaseWithTasks | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const addPhase = async () => {
    if (!newPhaseTitle.trim()) return;
    try {
      await api.post("/phases", {
        boardId,
        title: newPhaseTitle,
        dueDate: dueDate || null,
        order: phases.length,
      });
      setNewPhaseTitle("");
      setDueDate("");
      onRefresh();
    } catch (err) {
      console.error("Phase deployment failed:", err);
    }
  };

  const handleComplete = async (phaseId: string) => {
    setIsTransitioning(true);
    try {
      await api.post(`/phases/${phaseId}/complete`, { boardId });

      fire(2.5);

      onRefresh();
    } catch (err) {
      console.error("Transition Protocol Failed", err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleDeletePhase = async () => {
    if (!phaseToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/phases/${phaseToDelete.id}`);
      onRefresh();
      setPhaseToDelete(null);
    } catch (err) {
      console.error("Decommission protocol failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPhaseProgress = (phase: PhaseWithTasks) => {
    if (!phase.tasks || phase.tasks.length === 0) return 0;
    const completed = phase.tasks.filter((t) => t.columnId === "done").length;
    return Math.round((completed / phase.tasks.length) * 100);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-[#1e293b] border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Trophy size={20} className="text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  Mission Phases
                </h2>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Strategic Milestones
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Phase List */}
          <div className="space-y-3 mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {phases.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-800 rounded-3xl">
                <Target size={32} className="text-slate-800 mb-3" />
                <p className="text-slate-600 text-[10px] uppercase font-black tracking-[0.2em]">
                  No active sectors defined.
                </p>
              </div>
            )}

            {phases.map((phase: PhaseWithTasks) => {
              const progress = getPhaseProgress(phase);

              return (
                <div
                  key={phase.id}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${
                    phase.status === "active"
                      ? "bg-indigo-500/5 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                      : "bg-[#0f172a] border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Progress Radial */}
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          className="text-slate-800"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={100}
                          strokeDashoffset={100 - progress}
                          className={`${phase.status === "completed" ? "text-indigo-500" : "text-emerald-500"} transition-all duration-1000`}
                        />
                      </svg>
                      <span className="absolute text-[8px] font-black text-white">
                        {progress}%
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-sm font-bold ${phase.status === "completed" ? "text-slate-500 line-through" : "text-slate-200"}`}
                      >
                        {phase.title}
                      </span>
                      {phase.dueDate && (
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(phase.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {phase.status === "active" && (
                      <button
                        disabled={isTransitioning}
                        onClick={() => handleComplete(phase.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => setPhaseToDelete(phase)}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        phase.status === "active"
                          ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          : phase.status === "completed"
                            ? "bg-slate-800/50 text-slate-500 border-slate-700"
                            : "bg-slate-800/20 text-slate-600 border-transparent"
                      }`}
                    >
                      {phase.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Plus size={14} className="text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Initialize New Phase
              </span>
            </div>
            <input
              value={newPhaseTitle}
              onChange={(e) => setNewPhaseTitle(e.target.value)}
              placeholder="Phase Identifier..."
              className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-colors"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-indigo-500 scheme-dark"
              />
              <button
                onClick={addPhase}
                className="px-6 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all flex items-center justify-center group"
              >
                <Plus
                  size={20}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={!!phaseToDelete}
        title={phaseToDelete?.title || ""}
        onClose={() => setPhaseToDelete(null)}
        onConfirm={handleDeletePhase}
        loading={isDeleting}
        variant="danger"
        description="Permanently decommissioning this phase will remove its timeline and requirements. This action cannot be undone."
        confirmText="Decommission Phase"
        requireConfirmationText={phaseToDelete?.title}
      />
    </>
  );
}
