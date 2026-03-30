"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  ShieldCheck,
  UserPlus,
  X,
  Check,
  Clock,
  Loader2,
  Copy,
  CheckCircle,
  Fingerprint,
  AlertCircle,
  History,
  ArrowUpRight,
  Trash2,
  Lock,
  Terminal,
  Activity,
} from "lucide-react";
import type { AccessRequest, ActivityLog } from "@/shared/types";

export default function AdminQueue() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvalLink, setApprovalLink] = useState<string | null>(null);
  const [confirmDenyId, setConfirmDenyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqRes, logRes] = await Promise.all([
        api.get("/invites/admin/requests"),
        api.get("/invites/admin/logs"),
      ]);
      setRequests(reqRes.data);
      setHistory(logRes.data);
    } catch (err) {
      console.error("System Override Error: Failed to fetch telemetry", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = async (id: string, status: "approved" | "denied") => {
    setProcessingId(id);
    const requestToProcess = requests.find((r) => r.id === id);

    try {
      const res = await api.patch(`/invites/admin/requests/${id}`, { status });

      if (status === "approved" && res.data.result?.inviteUrl) {
        setApprovalLink(res.data.result.inviteUrl);
      }

      if (requestToProcess) {
        const newLog: ActivityLog = {
          id: Math.random().toString(),
          email: requestToProcess.targetEmail,
          action: status,
          timestamp: new Date().toISOString(),
          adminName: "System Admin",
        };
        setHistory((prev) => [newLog, ...prev]);
      }

      setRequests((prev) => prev.filter((r) => r.id !== id));
      setConfirmDenyId(null);
    } catch (err) {
      console.error(err);
      alert("Protocol Failure: Could not finalize request.");
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = async () => {
    if (approvalLink) {
      await navigator.clipboard.writeText(approvalLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-6 bg-[#0f172a]">
        <div className="relative flex items-center justify-center">
          <Loader2
            className="animate-spin text-indigo-500"
            size={64}
            strokeWidth={1.5}
          />
          <Lock className="absolute text-indigo-400/50" size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">
          Synchronizing Security Logs
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-10 pb-40 text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* 🛡️ Header Section */}
        <header className="bg-[#1e293b] border-2 border-slate-800 rounded-[3.5rem] p-12 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none transition-all group-hover:bg-indigo-500/10" />

          <div className="flex items-center gap-10 relative z-10">
            <div className="w-20 h-20 bg-white text-[#0f172a] rounded-4xl shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center border-4 border-slate-800 transition-transform group-hover:rotate-6">
              <ShieldCheck size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter antialiased">
                Access Queue
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  Clearance Protocol Active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border-2 border-slate-800 px-8 py-5 rounded-[2.5rem] text-center relative z-10 shadow-inner">
            <p className="text-3xl font-black text-white leading-none tracking-tighter">
              {requests.length}
            </p>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">
              Pending Units
            </p>
          </div>
        </header>

        {/* 📋 Active Requests Section */}
        <section>
          <div className="flex items-center gap-4 mb-8 px-8">
            <UserPlus size={18} className="text-indigo-400" />
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Authorization Requests
            </h2>
          </div>
          <div className="grid gap-6">
            {requests.length === 0 ? (
              <div className="bg-[#1e293b]/30 border-2 border-dashed border-slate-800 rounded-[4rem] py-24 text-center">
                <Terminal className="mx-auto text-slate-800 mb-4" size={32} />
                <p className="text-slate-600 font-bold tracking-tight">
                  Perimeter secure. No pending authorizations.
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className={`group bg-[#1e293b] border-2 border-slate-800 p-10 rounded-[3.5rem] flex items-center justify-between transition-all hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 ${
                    processingId === req.id ? "opacity-30 grayscale" : ""
                  }`}
                >
                  <div className="flex items-center gap-10">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-[#0f172a] border-2 border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all duration-500 shadow-inner">
                      <Fingerprint size={40} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-3">
                      <p className="font-black text-2xl text-white tracking-tight">
                        {req.targetEmail}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0f172a] rounded-full text-[10px] font-black text-slate-500 uppercase border border-slate-800/50">
                          <Clock size={12} />{" "}
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase border border-indigo-500/10">
                          <Activity size={12} /> UUID: {req.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setConfirmDenyId(req.id)}
                      className="w-16 h-16 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all border border-transparent hover:border-rose-400/20"
                    >
                      <X size={28} />
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "approved")}
                      className="bg-white text-[#0f172a] px-12 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 group/btn"
                    >
                      <Check
                        size={20}
                        strokeWidth={3}
                        className="group-hover/btn:scale-110 transition-transform"
                      />
                      Grant Access
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 📜 Activity Log Section */}
        <section className="pt-20 border-t border-slate-800/50">
          <div className="flex items-center gap-4 mb-10 px-8">
            <History size={18} className="text-slate-500" />
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Security Audit Log
            </h2>
          </div>
          <div className="bg-[#1e293b] border-2 border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0f172a]/50 border-b-2 border-slate-800">
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      Admin Entity
                    </th>
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      Target Unit
                    </th>
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      Timestamp
                    </th>
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">
                      Protocol Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-800/50">
                  {history.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-16 text-center text-slate-600 text-xs font-bold italic tracking-tight"
                      >
                        Audit database currently empty.
                      </td>
                    </tr>
                  ) : (
                    history.map((log) => (
                      <tr
                        key={log.id}
                        className="group hover:bg-[#0f172a]/30 transition-colors"
                      >
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                log.action === "approved"
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                  : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                              }`}
                            >
                              {log.action === "approved" ? (
                                <ArrowUpRight size={16} strokeWidth={2.5} />
                              ) : (
                                <Trash2 size={16} strokeWidth={2.5} />
                              )}
                            </div>
                            <span className="text-sm font-black text-white tracking-tight">
                              {log.adminName}
                            </span>
                          </div>
                        </td>
                        <td className="p-8 text-xs font-bold text-slate-400">
                          {log.email}
                        </td>
                        <td className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-tight">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-8 text-right">
                          <span
                            className={`inline-block px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${
                              log.action === "approved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 📋 Approval Modal */}
        {approvalLink && (
          <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-2xl flex items-center justify-center p-8 z-100 animate-in fade-in duration-300">
            <div className="bg-[#1e293b] rounded-[4rem] p-16 max-w-xl w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 border-2 border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <CheckCircle size={48} strokeWidth={1.5} />
              </div>

              <h2 className="text-4xl font-black text-white mb-3 text-center tracking-tighter antialiased">
                Unit Authorized
              </h2>
              <p className="text-slate-500 font-bold text-sm mb-10 text-center tracking-tight">
                Secure onboarding key generated successfully.
              </p>

              <div className="relative group">
                <button
                  onClick={copyToClipboard}
                  className="w-full p-8 bg-[#0f172a] border-2 border-slate-800 rounded-[2.5rem] break-all font-mono text-xs text-indigo-400 text-left relative overflow-hidden shadow-inner group-hover:border-indigo-500/40 transition-all"
                >
                  {approvalLink}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-[#1e293b] rounded-2xl shadow-2xl text-slate-500 group-hover:text-white transition-all border border-slate-800">
                    {copied ? (
                      <Check
                        size={20}
                        className="text-emerald-400"
                        strokeWidth={3}
                      />
                    ) : (
                      <Copy size={20} />
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={() => setApprovalLink(null)}
                className="w-full mt-12 bg-white text-[#0f172a] py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
              >
                Protocol Complete
              </button>
            </div>
          </div>
        )}

        {/* ⚠️ Deny Confirmation */}
        {confirmDenyId && (
          <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-center p-8 z-100 animate-in fade-in duration-300">
            <div className="bg-[#1e293b] rounded-[3.5rem] p-12 max-w-md w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 border-2 border-slate-800">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-4xl flex items-center justify-center mb-8 border-2 border-rose-500/20">
                <AlertCircle size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tighter antialiased">
                Terminate Request?
              </h2>
              <p className="text-slate-500 text-sm font-bold mb-10 leading-relaxed tracking-tight">
                This identity unit will be purged from the active queue. This
                action is recorded in the permanent audit log.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmDenyId(null)}
                  className="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={() => handleAction(confirmDenyId, "denied")}
                  className="flex-1 bg-rose-500 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(244,63,94,0.3)] hover:bg-rose-400 transition-all active:scale-95"
                >
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🍞 Toast Notification */}
        {copied && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white text-[#0f172a] px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 z-110 flex items-center gap-3">
            <Check size={14} strokeWidth={4} className="text-emerald-600" />
            Key Copied to Clipboard
          </div>
        )}
      </div>
    </div>
  );
}
