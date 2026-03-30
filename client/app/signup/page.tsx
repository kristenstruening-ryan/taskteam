"use client";

import { useState } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserPlus, ShieldCheck, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignup = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/signup", { name, email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.dispatchEvent(new Event("storage"));

      const callback = searchParams.get("callback");
      const inviteToken = searchParams.get("token");

      if (callback && inviteToken) {
        router.push(`${callback}?token=${inviteToken}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#1e293b] rounded-[3.5rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.6)] p-12 border border-slate-800 animate-in fade-in zoom-in-95 duration-500 relative z-10">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600/10 rounded-4xl border-2 border-indigo-500/20 text-indigo-400 mb-8 shadow-2xl shadow-indigo-500/10">
            <UserPlus size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter antialiased">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">
            Identity Initialization Protocol
          </p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-rose-500/10 text-rose-400 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-rose-500/20 flex items-center gap-3">
             <ShieldCheck size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
              <User size={12} className="text-indigo-400" /> Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-5 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold text-sm shadow-inner"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
              <Mail size={12} className="text-indigo-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-5 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold text-sm shadow-inner"
              placeholder="kristen@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
              <Lock size={12} className="text-indigo-400" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-5 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold text-sm shadow-inner"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#0f172a] hover:bg-indigo-50 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl transition-all mt-6 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Create Free Account
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-slate-800/50 text-center">
          <p className="text-xs text-slate-500 font-bold tracking-tight">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-white hover:text-indigo-400 font-black transition-colors underline decoration-indigo-500 decoration-2 underline-offset-4"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}