"use client";

import { useState } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
      setError(axiosError.response?.data?.error || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50/50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Join the team and start collaborating.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              placeholder="John D."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              placeholder="kristen@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all mt-4 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Free Account"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
