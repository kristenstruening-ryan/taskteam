"use client";

import { useState } from "react";
import api from "@/lib/api";
import { X, UserPlus, Check, Copy, Shield, Users, Loader2 } from "lucide-react";
import type { InviteModalProps } from "@/shared/types";

export default function InviteModal({ boardId, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/invites/board/${boardId}`, { email, role });
      setInviteUrl(res.data.inviteUrl);
    } catch (err) {
      console.error("Failed to create invite", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-[#1e293b] w-full max-w-md rounded-[3.5rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-800">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="p-10 relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 border border-indigo-400/20">
                <UserPlus size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">
                  Add Member
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1">
                  Expansion Protocol
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-900/50 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all text-slate-500 border border-slate-800"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {!inviteUrl ? (
            <form onSubmit={handleGenerateInvite} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full bg-[#0f172a] border-2 border-slate-800 p-5 rounded-3xl text-sm font-bold text-white outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 block">
                  Permissions Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "member", label: "Member", icon: Users },
                    { id: "admin", label: "Admin", icon: Shield },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        role === r.id
                          ? "bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                          : "bg-[#0f172a] border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      <r.icon size={16} strokeWidth={role === r.id ? 3 : 2} />
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {r.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-5 bg-white text-[#0f172a] rounded-4xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Generate Credentials"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-[#0f172a]/80 border border-emerald-500/20 rounded-4xl backdrop-blur-md">
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <Check size={18} strokeWidth={3} />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Link Generated
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">
                  This secure access link will expire in{" "}
                  <span className="text-white">7 days</span>.
                </p>
              </div>

              <div className="relative group">
                <input
                  readOnly
                  value={inviteUrl}
                  className="w-full bg-[#0f172a] border-2 border-slate-800 p-5 pr-32 rounded-3xl text-[11px] font-bold text-indigo-400 truncate shadow-inner"
                />
                <button
                  onClick={copyToClipboard}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    copied
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  }`}
                >
                  {copied ? (
                    "Copied"
                  ) : (
                    <div className="flex items-center gap-2">
                      <Copy size={12} strokeWidth={3} /> Copy
                    </div>
                  )}
                </button>
              </div>

              <button
                onClick={() => setInviteUrl("")}
                className="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all"
              >
                Restart Expansion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
