"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, UserCircle2, Loader2 } from "lucide-react";
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
      let errorMessage = isLogin
        ? "Invalid credentials"
        : "Registration failed";

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6 bg-slate-50/50">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <h1 className="text-3xl font-black text-slate-800 text-center mb-2">
          {isLogin ? "Welcome Back" : "Get Started"}
        </h1>
        <p className="text-slate-400 text-center text-sm font-medium mb-8">
          {isLogin
            ? "Enter your details to sign in"
            : "Create your TaskTeam account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <span className="text-blue-600">Sign Up</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className="text-blue-600">Sign In</span>
              </>
            )}
          </button>
        </div>

        {/* Demo Section */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 text-center">
            Demo Access
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGuestLogin("admin@taskteam.com")}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group disabled:opacity-50"
              style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
            >
              <ShieldCheck
                className="mb-1 group-hover:scale-110 transition-transform"
                size={20}
                style={{ color: "#d97706" }}
              />
              <span className="text-xs font-black" style={{ color: "#b45309" }}>
                Admin Mode
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleGuestLogin("kristen@example.com")}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 transition-all group"
            >
              <UserCircle2
                className="text-blue-600 mb-1 group-hover:scale-110 transition-transform"
                size={20}
              />
              <span className="text-xs font-black text-blue-700">
                Member Mode
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
