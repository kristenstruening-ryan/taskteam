"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowRight,
  Layout,
  Loader2,
  ChevronLeft,
  Rocket,
} from "lucide-react";
import { Zap } from "lucide-react";

export default function CreateWorkspaceWizard() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/boards", { title });
      router.push(`/boards/${res.data.id}`);
    } catch (err) {
      alert("System Error: Failed to initialize workspace.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Tactical Progress Bar */}
        <div className="flex justify-center gap-4 mb-16">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              step === 1
                ? "bg-indigo-500 w-12 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                : "bg-slate-800 w-6"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              step === 2
                ? "bg-indigo-500 w-12 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                : "bg-slate-800 w-6"
            }`}
          />
        </div>

        {step === 1 ? (
          <div className="space-y-8 text-center sm:text-left">
            <div className="inline-flex p-5 bg-indigo-600/10 text-indigo-400 rounded-4xl border-2 border-indigo-500/20 shadow-2xl shadow-indigo-500/10 mb-2">
              <Layout size={32} strokeWidth={2.5} />
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl font-black text-white leading-none tracking-tighter antialiased">
                Name your <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-500">
                  Workspace
                </span>
              </h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em]">
                Identity Initialization Required
              </p>
            </div>

            <div className="relative group">
              <input
                autoFocus
                className="w-full px-8 py-7 rounded-[2.5rem] border-2 border-slate-800 bg-[#1e293b] text-white text-2xl font-black placeholder:text-slate-700 focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none shadow-inner"
                placeholder="e.g. Project Phoenix"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <button
              disabled={!title}
              onClick={() => setStep(2)}
              className="w-full bg-white text-[#0f172a] py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-10 group shadow-2xl"
            >
              Continue{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
                strokeWidth={3}
              />
            </button>
          </div>
        ) : (
          <div className="space-y-8 text-center sm:text-left">
            <div className="inline-flex p-5 bg-amber-500/10 text-amber-500 rounded-4xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 mb-2">
              <Zap size={32} strokeWidth={2.5} />
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl font-black text-white leading-none tracking-tighter antialiased">
                Ready to <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500">
                  Launch?
                </span>
              </h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em]">
                Finalizing parameters for{" "}
                <span className="text-white">{title}</span>
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-indigo-500 text-white py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:bg-indigo-400 transition-all active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} strokeWidth={3} />
                ) : (
                  <>
                    Begin Mission <Rocket size={18} strokeWidth={3} />
                  </>
                )}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors py-2"
              >
                <ChevronLeft size={14} /> Re-configure Name
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
