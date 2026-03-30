import { Bell, CheckCheck, MessageSquareOff } from "lucide-react";
import type { ProjectNewsFeedProps } from "@/shared/types";

export default function PulseCard({
  unreadMentions,
  velocity,
  onMarkRead,
}: ProjectNewsFeedProps) {
  const getStatus = () => {
    if (unreadMentions > 5)
      return {
        label: "Attention Required",
        color: "bg-red-500",
        text: "text-red-400",
      };
    if (unreadMentions > 0)
      return {
        label: "Updates Pending",
        color: "bg-amber-500",
        text: "text-amber-400",
      };
    return {
      label: "Healthy",
      color: "bg-emerald-500",
      text: "text-emerald-400",
    };
  };

  const status = getStatus();

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col justify-between h-full relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-slate-700 to-transparent opacity-50" />

      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div
              className={`p-5 rounded-2xl border ${unreadMentions > 0 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}
            >
              <Bell
                size={26}
                className={unreadMentions > 0 ? "animate-bounce" : ""}
              />
            </div>
            <div>
              <h3 className="font-black text-white text-2xl tracking-tighter">
                Project Pulse
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${status.color} shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${status.text}`}
                >
                  {status.label}
                </span>
              </div>
            </div>
          </div>
          {unreadMentions > 0 && (
            <button
              onClick={onMarkRead}
              className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700 transition-all"
            >
              <CheckCheck size={20} />
            </button>
          )}
        </div>

        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 mb-8">
          <p className="text-slate-400 text-sm leading-relaxed font-bold">
            {unreadMentions > 0 ? (
              <>
                You have{" "}
                <span className="text-amber-400">
                  {unreadMentions} unread mentions
                </span>{" "}
                in chat.
              </>
            ) : (
              <span className="flex items-center gap-2 italic opacity-40">
                <MessageSquareOff size={16} /> No new mentions.
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
          <span>Global Velocity</span>
          <span className="text-indigo-400">{velocity}%</span>
        </div>
        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="bg-indigo-500 h-full rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-1000"
            style={{ width: `${velocity}%` }}
          />
        </div>
      </div>
    </div>
  );
}
