"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("local-storage-update", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("local-storage-update", callback);
  };
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const userEmail = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("user_email") || "User",
    () => "User",
  );

  const userName = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("user_name") || "",
    () => "",
  );

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase() || "U";
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const initial = getInitials(userName, userEmail);

  return (
    <nav className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-100">
      <div className="flex items-center gap-8">
        <Link
          href={isAuthPage ? "#" : "/dashboard"}
          className="text-xl font-black text-blue-600 tracking-tighter hover:opacity-80 transition-opacity"
        >
          TaskTeam
        </Link>
      </div>

      {!isAuthPage && (
        <div className="flex items-center gap-4 animate-in fade-in duration-500">
          <NotificationBell />
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="group relative">
            <button className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-200 transition-transform group-hover:scale-105 active:scale-95">
                {initial}
              </div>
            </button>

            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-4xl py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-110 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 mb-2 bg-slate-50/50">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">
                  Signed in as
                </p>
                <p className="text-sm font-black text-slate-900 truncate">
                  {userName || "New Member"}
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate">
                  {userEmail}
                </p>
              </div>

              <div className="px-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-2xl font-bold transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Profile Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all mt-1"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
