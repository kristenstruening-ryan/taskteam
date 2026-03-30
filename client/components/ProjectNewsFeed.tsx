"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Meeting, NotificationItem } from "@/shared/types";
import MeetingCard from "./MeetingCard";
import PulseCard from "./PulseCard";

export default function ProjectNewsFeed({ boardId, velocity }: { boardId: string; velocity: number }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [unreadMentions, setUnreadMentions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const [meetingsRes, notificationsRes] = await Promise.all([
          api.get(`/meetings/board/${boardId}`),
          api.get(`/notifications?boardId=${boardId}`),
        ]);
        setMeetings(meetingsRes.data);
        const unread = notificationsRes.data.filter((n: NotificationItem) => !n.isRead).length;
        setUnreadMentions(unread);
      } catch (err) {
        console.error("Failed to fetch news feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [boardId]);

  const handleMarkAsRead = async () => {
    try {
      await api.post(`/notifications/mark-read`, { boardId });
      setUnreadMentions(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-slate-800/50 rounded-[2.5rem]" />;

  const upcomingMeeting = meetings[0];
  const isLive = upcomingMeeting && (() => {
    const start = new Date(upcomingMeeting.startTime).getTime();
    const now = currentTime.getTime();
    return now >= start && now <= start + (60 * 60 * 1000);
  })();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <MeetingCard meeting={upcomingMeeting} isLive={!!isLive} />
      <PulseCard
        unreadMentions={unreadMentions}
        velocity={velocity}
        onMarkRead={handleMarkAsRead}
      />
    </div>
  );
}