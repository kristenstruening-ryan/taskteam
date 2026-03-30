"use client";
import { useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { ShieldCheck, LogOut, Settings, UserPlus, LogIn } from "lucide-react";
import { AuthUser } from "@/shared/types";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("local-storage-update", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("local-storage-update", callback);
  };
}

function getSnapshot() {
  const saved = localStorage.getItem("user");
  return saved ? saved : "";
}

function getServerSnapshot() {
  return "";
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const userJson = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const user = useMemo(() => {
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthUser;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [userJson]);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("local-storage-update"));

    router.push("/");
  };

  const userRole = user?.systemRole || "user";
  const userName = user?.name || "Member";
  const userEmail = user?.email || "";

  const initial = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail.charAt(0).toUpperCase() || "U";

  return (
    <nav className="h-18 border-b border-slate-200 dark:border-slate-800 bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-2xl font-black text-accent tracking-tighter"
        >
          TaskTeam
        </Link>
      </div>

      {!isAuthPage && (
        <div className="flex items-center gap-4 animate-in fade-in duration-500">
          {user ? (
            <>
              <NotificationBell />
              <div className="h-6 w-px bg-slate-200 mx-2" />

              <div className="group relative">
                <div className="flex items-center gap-4 cursor-pointer">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white text-xs font-black shadow-lg shadow-accent/20">
                    {initial}
                  </div>
                </div>

                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-50 mb-2 bg-slate-50/50">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                      Account
                    </p>
                    <p className="text-sm font-black text-slate-900 truncate">
                      {userName}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 truncate">
                      {userEmail}
                    </p>
                  </div>

                  <div className="px-2 space-y-1">
                    {userRole === "admin" && (
                      <Link
                        href="/admin/queue"
                        className="flex items-center gap-3 px-4 py-3 text-sm rounded-2xl font-black transition-all border bg-[#fffbeb] border-[#fde68a] text-[#b45309]"
                      >
                        <ShieldCheck size={16} className="text-[#d97706]" />
                        Access Queue
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-2xl font-bold transition-all"
                    >
                      <Settings size={16} className="text-slate-400" />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all text-left"
                    >
                      <LogOut size={16} className="text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* LOGGED OUT / GUEST VIEW */
            <div className="flex items-center gap-4 lg:gap-8">
              <Link
                href="/invite/accept"
                className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-500 transition-colors border-b-2 border-transparent hover:border-indigo-500/20 pb-1"
              >
                Accept Invite
              </Link>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-accent transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <LogIn size={14} />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center gap-2 active:scale-95"
                >
                  <UserPlus size={14} />
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
