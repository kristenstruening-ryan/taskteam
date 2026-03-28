"use client";

import { useState } from "react";
import api from "@/lib/api";

interface InviteModalProps {
  boardId: string;
  onClose: () => void;
}

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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-200 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800">
            Invite Team Member
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!inviteUrl ? (
            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
                  Assign Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                {loading ? "Generating..." : "Generate Invite Link"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-blue-700 text-xs font-bold leading-relaxed">
                  Share this link with your teammate. It will expire in 7 days.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-medium text-slate-500 truncate"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-6 rounded-2xl font-black text-xs transition-all ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <button
                onClick={() => setInviteUrl("")}
                className="w-full py-3 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
              >
                Create another invite
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
