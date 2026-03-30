"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Send, MessageSquareOff, Loader2 } from "lucide-react";
import type { Comment, CommentListProps } from "@/shared/types";

export default function CommentList({
  taskId,
  boardId,
  currentUser,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!taskId && !boardId) return;
    try {
      const endpoint = taskId
        ? `/comments/task/${taskId}`
        : `/comments/board/${boardId}`;

      const res = await api.get(endpoint);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  }, [boardId, taskId]);

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 5000);
    return () => clearInterval(interval);
  }, [fetchComments, taskId]);

  const handlePost = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post("/comments", {
        content: newComment,
        boardId: boardId,
        taskId: taskId,
      });

      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 p-2">
      <form onSubmit={handlePost} className="relative group">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={taskId ? "Add to discussion..." : "Broadcast to team..."}
          className="w-full bg-[#0f172a] border-2 border-slate-800 p-5 pr-20 rounded-4xl text-sm font-bold text-white outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner placeholder:text-slate-600"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all group-focus-within:shadow-indigo-500/20"
        >
          <Send size={18} strokeWidth={2.5} />
        </button>
      </form>

      {/* Chat Feed */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
        {loading && comments.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <MessageSquareOff size={40} className="text-slate-500 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Silence is golden
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isMe = comment.userId === currentUser?.id;
            return (
              <div
                key={comment.id}
                className={`flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className="flex items-center gap-3 mb-2 px-1">
                  {!isMe && (
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      {comment.user?.name ||
                        comment.user?.email?.split("@")[0] ||
                        `Agent_${comment.userId?.slice(0, 4)}` ||
                        "Unknown Unit"}
                    </span>
                  )}

                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className={`p-5 rounded-4xl border shadow-xl ${
                    isMe
                      ? "bg-indigo-600 border-indigo-400 text-white rounded-tr-none shadow-indigo-500/10"
                      : "bg-[#1e293b] border-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm font-bold leading-relaxed antialiased">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
