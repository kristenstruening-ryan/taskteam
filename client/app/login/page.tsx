"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, UserCircle2, Loader2, KeyRound, ArrowRight, Sparkles, Fingerprint } from "lucide-react";
import axios from "axios";
import { AuthResponse } from "@/shared/types";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLoginSuccess = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("storage"));

    const callback = searchParams.get("callback");
    const inviteToken = searchParams.get("token");

    if (callback && inviteToken) {
      router.push(`${callback}?token=${inviteToken}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin ? { email, password } : { email, password, name };

      const res = await api.post<AuthResponse>(endpoint, payload);
      handleLoginSuccess(res.data);
    } catch (error: unknown) {
      let errorMessage = isLogin ? "Invalid credentials" : "Registration failed";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (guestEmail: string) => {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/login", {
        email: guestEmail,
        password: "password123",
      });
      handleLoginSuccess(res.data);
    } catch (error: unknown) {
      alert("Demo login failed. Is the server running and seeded?");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden">
      {/* Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="bg-[#1e293b] p-12 rounded-[3.5rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.6)] border border-slate-800 w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 relative z-10">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600/10 rounded-4xl border-2 border-indigo-500/20 text-indigo-400 mb-8 shadow-2xl shadow-indigo-500/10">
            {isLogin ? <Fingerprint size={32} strokeWidth={2.5} /> : <Sparkles size={32} strokeWidth={2.5} />}
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter antialiased">
            {isLogin ? "Welcome Back" : "Get Started"}
          </h1>
          <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">
            {isLogin ? "Identity Verification Required" : "Identity Initialization Protocol"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Full Name</label>
               <input
                type="text"
                required
                className="w-full px-6 py-5 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm shadow-inner"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-6 py-5 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm shadow-inner"
              placeholder="kristen@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-6 py-5 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-white text-[#0f172a] hover:bg-indigo-50 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl transition-all mt-6 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 group"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-slate-500 hover:text-white transition-colors tracking-tight"
          >
            {isLogin ? (
              <>Need an account? <span className="text-white font-black underline underline-offset-4 decoration-indigo-500 decoration-2 ml-1">Sign Up</span></>
            ) : (
              <>Already registered? <span className="text-white font-black underline underline-offset-4 decoration-indigo-500 decoration-2 ml-1">Sign In</span></>
            )}
          </button>
        </div>

        {/* Tactical Demo Section */}
        <div className="mt-10 pt-10 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-6 justify-center">
             <KeyRound size={12} className="text-indigo-400" />
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Quick Access Overrides</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGuestLogin("admin@taskteam.com")}
              className="flex flex-col items-center justify-center p-5 rounded-3xl border-2 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all group disabled:opacity-50"
            >
              <ShieldCheck className="mb-2 text-amber-500 group-hover:scale-110 transition-transform" size={22} />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Admin Mode</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleGuestLogin("kristen@example.com")}
              className="flex flex-col items-center justify-center p-5 rounded-3xl border-2 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all group disabled:opacity-50"
            >
              <UserCircle2 className="mb-2 text-indigo-400 group-hover:scale-110 transition-transform" size={22} />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Member Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}