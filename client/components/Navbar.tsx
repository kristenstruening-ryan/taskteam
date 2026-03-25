"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("User");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const saved = localStorage.getItem("user_email");
      if (saved) setUserEmail(saved);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const syncUser = useCallback(() => {
    const saved = localStorage.getItem("user_email");
    if (saved !== userEmail) {
      setUserEmail(saved || "User");
    }
  }, [userEmail]);

  useEffect(() => {
    if (!mounted) return;
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, [syncUser, mounted]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    router.push("/login");
  };

  const initial = mounted ? userEmail.charAt(0).toUpperCase() : "U";
  return (
    <nav className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link
          href="/dashboard"
          className="text-xl font-black text-blue-600 tracking-tighter"
        >
          TaskTeam
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
        >
          Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="h-8 w-px bg-slate-200 mx-2" />

        <div className="group relative">
          <button className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg transition-all">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
          </button>

          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Signed in as
              </p>
              <p className="text-xs font-bold text-slate-700 truncate">
                {userEmail}
              </p>
            </div>
            <Link
              href="/profile"
              className="block w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              Profile Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
