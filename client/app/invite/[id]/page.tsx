"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";
import {
  Loader2,
  Fingerprint,
  ShieldAlert,
  ChevronRight,
  Layout,
} from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const { id } = useParams();

  const [status, setStatus] = useState("Initializing handshake...");
  const [error, setError] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current || !id) return;

    const processInvite = async () => {
      hasProcessed.current = true;
      const authToken = localStorage.getItem("token");

      if (!authToken) {
        setStatus("Identity required. Redirecting to portal...");
        setTimeout(() => {
          router.push(`/login?callback=/invite/${id}`);
        }, 1500);
        return;
      }

      try {
        setStatus("Verifying security token...");

        const verifyRes = await api.get(`/invites/verify/${id}`);
        const { boardName } = verifyRes.data.invite;

        setStatus(`Access granted to "${boardName}"`);

        await api.post("/invites/accept", { token: id });

        setStatus("Success. Syncing workspace data...");
        setTimeout(() => {
          router.push(`/dashboard/projects/${id}`);
        }, 1000);
      } catch (err: unknown) {
        setError(true);
        let errorMessage = "Token invalid or expired.";

        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || errorMessage;
        }
        setStatus(errorMessage);
      }
    };

    processInvite();
  }, [id, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="bg-[#1e293b] p-12 rounded-[3.5rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.6)] border border-slate-800 w-full max-w-md animate-in fade-in zoom-in-95 duration-500 relative z-10 text-center">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-4xl border-2 mb-8 shadow-2xl transition-colors duration-500 ${
            error
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-500/10"
              : "bg-indigo-600/10 border-indigo-500/20 text-indigo-400 shadow-indigo-500/10"
          }`}
        >
          {error ? (
            <ShieldAlert size={32} strokeWidth={2.5} />
          ) : (
            <Fingerprint
              size={32}
              strokeWidth={2.5}
              className="animate-pulse"
            />
          )}
        </div>

        <h1 className="text-3xl font-black text-white tracking-tighter antialiased mb-2">
          {error ? "Access Denied" : "Project Invite"}
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
          {error ? "Protocol Termination" : "System Handshake in Progress"}
        </p>

        <div
          className={`py-5 px-6 rounded-2xl border-2 transition-all duration-500 flex items-center justify-center gap-3 ${
            error
              ? "bg-rose-500/5 border-rose-500/10"
              : "bg-[#0f172a] border-slate-800 shadow-inner"
          }`}
        >
          {!error && (
            <Loader2 size={16} className="animate-spin text-indigo-400" />
          )}
          <p
            className={`text-xs font-bold tracking-tight ${
              error ? "text-rose-400" : "text-slate-300"
            }`}
          >
            {status}
          </p>
        </div>

        {error && (
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-8 w-full py-5 bg-white text-[#0f172a] rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group shadow-xl"
          >
            Return to Dashboard
            <ChevronRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
              strokeWidth={3}
            />
          </button>
        )}

        {!error && (
          <div className="mt-10 flex items-center justify-center gap-2 text-slate-600">
            <Layout size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              TaskTeam Secure Link
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
