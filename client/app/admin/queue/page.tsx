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
      console.error("Failed to fetch data", err);
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

      // Locally update history for immediate feedback
      if (requestToProcess) {
        const newLog: ActivityLog = {
          id: Math.random().toString(),
          email: requestToProcess.targetEmail,
          action: status,
          timestamp: new Date().toISOString(),
          adminName: "Current Admin",
        };
        setHistory((prev) => [newLog, ...prev]);
      }

      setRequests((prev) => prev.filter((r) => r.id !== id));
      setConfirmDenyId(null);
    } catch (err) {
      alert("Failed to process request.");
      console.error(err);
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
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4 bg-[#f8fafc]">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <ShieldCheck className="absolute inset-0 m-auto text-blue-200" size={20} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Syncing Audit Logs
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 pb-32 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

        {/* 🛡️ Header Section */}
        <header className="bg-white border border-slate-200/60 rounded-[3rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          <div className="flex items-center gap-10 relative z-10">
            <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl ring-8 ring-slate-50">
              <ShieldCheck size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                Access Queue
              </h1>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   Security Management Active
                 </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 px-6 py-3 rounded-2xl text-center relative z-10">
            <p className="text-2xl font-black text-amber-700 leading-none">
              {requests.length}
            </p>
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-1">
              Pending
            </p>
          </div>
        </header>

        {/* 📋 Active Requests Section */}
        <section>
          <div className="flex items-center gap-4 mb-6 px-6">
            <UserPlus size={18} className="text-blue-500" />
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Awaiting Authorization
            </h2>
          </div>
          <div className="grid gap-4">
            {requests.length === 0 ? (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] py-20 text-center">
                <p className="text-slate-400 font-bold italic">Queue is currently clear.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className={`group bg-white border border-slate-200/60 p-8 rounded-[3rem] flex items-center justify-between transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 ${
                    processingId === req.id ? "opacity-50 grayscale" : ""
                  }`}
                >
                  <div className="flex items-center gap-8">
                    <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <UserPlus size={32} />
                    </div>
                    <div>
                      <p className="font-black text-xl text-slate-900 mb-2">
                        {req.targetEmail}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">
                          <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase">
                          <Fingerprint size={12} /> ID: {req.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmDenyId(req.id)}
                      className="p-5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all border border-transparent hover:border-red-100"
                    >
                      <X size={24} />
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "approved")}
                      className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                      <Check size={20} /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 📜 Activity Log Section */}
        <section className="pt-10 border-t border-slate-200">
          <div className="flex items-center gap-4 mb-8 px-6">
            <History size={18} className="text-slate-400" />
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Recent Activity Log
            </h2>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-[3rem] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400 text-xs italic">
                      No recent activity found.
                    </td>
                  </tr>
                ) : (
                  history.map((log) => (
                    <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${log.action === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                            {log.action === "approved" ? <ArrowUpRight size={14} /> : <Trash2 size={14} />}
                          </div>
                          <span className="text-[11px] font-black text-slate-900">{log.adminName}</span>
                        </div>
                      </td>
                      <td className="p-6 text-xs font-bold text-slate-600">{log.email}</td>
                      <td className="p-6 text-[10px] font-medium text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-6 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          log.action === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 📋 Approval Modal */}
        {approvalLink && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
            <div className="bg-white rounded-[4rem] p-16 max-w-lg w-full shadow-2xl animate-in zoom-in-95 border border-white/20">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-8 mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">User Authorized</h2>
              <p className="text-slate-500 font-medium mb-8 text-center">Copy and share this secure onboarding link:</p>

              <button
                onClick={copyToClipboard}
                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] break-all font-mono text-xs text-blue-600 text-left relative group hover:border-blue-400 transition-all shadow-inner"
              >
                {approvalLink}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-2xl shadow-md text-slate-400 group-hover:text-blue-600 transition-all">
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </div>
              </button>
              <button
                onClick={() => setApprovalLink(null)}
                className="w-full mt-10 bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
              >
                Complete
              </button>
            </div>
          </div>
        )}

        {/* ⚠️ Deny Confirmation */}
        {confirmDenyId && (
          <div className="fixed inset-0 bg-red-950/20 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
            <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl animate-in zoom-in-95 border border-red-50">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Deny Access?</h2>
              <p className="text-slate-500 text-sm font-medium mb-8">This action is permanent. The request will be scrubbed from the active queue.</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConfirmDenyId(null)}
                  className="py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(confirmDenyId, "denied")}
                  className="bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
                >
                  Yes, Deny
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🍞 Toast Notification */}
        {copied && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-4 z-[110]">
            ✓ Link Copied to Clipboard
          </div>
        )}
      </div>
    </div>
  );
}