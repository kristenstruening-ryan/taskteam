"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { NotificationItem } from "@/shared/types";
import api from "@/lib/api";
import {
  Bell,
  CheckCircle2,
  XCircle,
  UserPlus,
  MessageSquare,
  Loader2,
  LucideIcon,
} from "lucide-react";

export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const bellContainerRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, []);

  const handleToggle = async () => {
    if (!isOpen) {
      setLoading(true);
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await api.patch(`/notifications/${n.id}/read`);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === n.id ? { ...notif, isRead: true } : notif,
          ),
        );
        fetchStatus();
      } catch (err) {
        console.error("Error marking as read", err);
      }
    }

    setIsOpen(false);
    if (n.type === "access_request") {
      router.push("/admin/queue");
    } else if (n.taskId) {
      router.push(`/dashboard?task=${n.taskId}`);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        bellContainerRef.current &&
        !bellContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const renderContent = (n: NotificationItem) => {
    const iconMap: Record<
      string,
      { icon: LucideIcon; color: string; label: string }
    > = {
      access_request: {
        icon: UserPlus,
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: "Access Request",
      },
      request_approved: {
        icon: CheckCircle2,
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        label: "Approved",
      },
      request_denied: {
        icon: XCircle,
        color: "bg-red-500/10 text-red-500 border-red-500/20",
        label: "Denied",
      },
      mention: {
        icon: MessageSquare,
        color: "bg-accent/10 text-accent border-accent/20",
        label: "New Mention",
      },
    };

    const config = iconMap[n.type] || iconMap.mention;
    const Icon = config.icon;

    return (
      <div className="flex gap-3">
        <div className={`mt-1 p-2 rounded-lg h-fit border ${config.color}`}>
          <Icon size={14} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-tight text-foreground">
            {config.label}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            {n.content || "New update pending."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={bellContainerRef}>
      <button
        onClick={handleToggle}
        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      >
        <Bell
          size={20}
          className="text-slate-600 dark:text-slate-400 group-hover:text-accent transition-colors"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-card shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-85 bg-card border border-slate-200 dark:border-slate-800 shadow-2xl rounded-4xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest">
              Notifications
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="animate-spin text-slate-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400 font-medium">
                All caught up! 🎈
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer relative ${
                    !n.isRead ? "bg-accent/5" : "opacity-60"
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                  )}
                  {renderContent(n)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
