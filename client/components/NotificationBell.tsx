"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { NotificationItem } from "@/shared/types";
import api from "@/lib/api";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notification list", err);
      }
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      if (isMounted) await fetchStatus();
    };
    loadInitialData();

    const interval = setInterval(() => {
      if (isMounted) fetchStatus();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        bellContainerRef.current &&
        !bellContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      fetchStatus();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <div className="relative" ref={bellContainerRef}>
      <button
        onClick={handleToggle}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center italic">
                All caught up!
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !n.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  <p className="text-xs text-slate-700">
                    <span className="font-bold text-blue-600">
                      {n.senderEmail}
                    </span>{" "}
                    mentioned you:
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic">
                    &quot;{n.commentContent}&quot;
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
