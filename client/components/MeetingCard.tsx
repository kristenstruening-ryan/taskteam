import { Calendar, Clock, ExternalLink, Radio } from "lucide-react";
import type { Meeting } from "@/shared/types";

interface MeetingCardProps {
  meeting?: Meeting;
  isLive: boolean;
}

export default function MeetingCard({ meeting, isLive }: MeetingCardProps) {
  return (
    <div className="relative overflow-hidden bg-[#4f46e5] rounded-[3rem] shadow-2xl shadow-indigo-500/20 group border border-white/10 h-full">
      <div className="absolute inset-0 bg-linear-to-br from-indigo-400/30 via-transparent to-black/40 z-0" />

      <div className="relative z-10 p-10 text-white antialiased h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-8">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <Calendar size={24} />
            </div>
            {isLive ? (
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-red-500 px-4 py-2 rounded-full border border-red-400 shadow-xl">
                <Radio size={12} strokeWidth={3} className="animate-pulse" /> Live
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-indigo-100">
                Upcoming Sync
              </span>
            )}
          </div>

          {meeting ? (
            <>
              <h3 className="text-3xl font-black mb-3 tracking-tighter leading-tight">
                {meeting.title}
              </h3>
              <div className="flex items-center gap-2 text-indigo-100/90 font-bold text-sm">
                <Clock size={16} />
                {new Date(meeting.startTime).toLocaleString([], {
                  weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </div>
            </>
          ) : (
            <p className="py-6 text-white/50 font-bold italic">No upcoming syncs scheduled.</p>
          )}
        </div>

        {meeting && (
          <div className="mt-8">
            <a href={meeting.meetingLink} target="_blank"
              className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
              Join Mission Control <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}