"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowRight, Sparkles, Layout, Loader2 } from "lucide-react";

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
      alert("Error creating workspace. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 pt-20 animate-in fade-in duration-700">
      <div className="flex justify-center gap-3 mb-12">
        <div
          className={`h-2 w-2 rounded-full ${step === 1 ? "bg-blue-600 w-8" : "bg-slate-200"} transition-all`}
        />
        <div
          className={`h-2 w-2 rounded-full ${step === 2 ? "bg-blue-600 w-8" : "bg-slate-200"} transition-all`}
        />
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-3xl mb-2">
            <Layout size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            What&aposs the team name?
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Every great project starts with a name. You can always change this
            later.
          </p>

          <input
            autoFocus
            className="w-full px-8 py-6 rounded-4xl border-2 border-slate-100 bg-white text-2xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
            placeholder="e.g. Marketing Ops"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button
            disabled={!title}
            onClick={() => setStep(2)}
            className="w-full bg-slate-900 text-white py-6 rounded-4xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            Next Step <ArrowRight size={24} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-3xl mb-2">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Ready to launch?
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            We&aposre setting up your workspace for <strong>{title}</strong>.
            You&aposll be the primary owner.
          </p>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-6 rounded-4xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create Workspace"
            )}
          </button>

          <button
            onClick={() => setStep(1)}
            className="w-full text-slate-400 font-bold hover:text-slate-900 transition-colors"
          >
            Actually, let&aposs change the name
          </button>
        </div>
      )}
    </div>
  );
}
