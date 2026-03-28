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
    const iconMap = {
      access_request: {
        icon: UserPlus,
        color: "bg-amber-100 text-amber-600",
        label: "Access Request",
      },
      request_approved: {
        icon: CheckCircle2,
        color: "bg-emerald-100 text-emerald-600",
        label: "Approved",
      },
      request_denied: {
        icon: XCircle,
        color: "bg-red-100 text-red-600",
        label: "Denied",
      },
      mention: {
        icon: MessageSquare,
        color: "bg-blue-100 text-blue-600",
        label: "New Mention",
      },
    };

    const config = iconMap[n.type] || iconMap.mention;
    const Icon = config.icon;

    return (
      <div className="flex gap-3">
        <div className={`mt-1 p-2 rounded-lg h-fit ${config.color}`}>
          <Icon size={14} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-tight text-slate-800">
            {config.label}
          </p>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
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
        className="p-2 rounded-xl hover:bg-slate-50 transition-all relative group border border-transparent hover:border-slate-100"
      >
        <Bell
          size={20}
          className="text-slate-600 group-hover:text-blue-600 transition-colors"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              Notifications
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
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
                  className={`px-6 py-5 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer relative ${!n.isRead ? "bg-white" : "opacity-50"}`}
                >
                  {!n.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-full" />
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
