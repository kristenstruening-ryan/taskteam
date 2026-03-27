"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Comment, User } from "@/shared/types";

interface Props {
  boardId: string;
  taskId?: string;
  currentUser: User | null;
}

export default function CommentList({ taskId, boardId, currentUser }: Props) {
  console.log("CommentList Props - TaskID:", taskId, "BoardID:", boardId);
  console.log(
    "Current Auth Token:",
    localStorage.getItem("token") ? "Exists" : "MISSING",
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    if (!taskId && !boardId) {
      console.log("Skipping fetch: No taskId or boardId found yet.");
      return;
    }
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
      console.error(err, "Failed to post comment");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <form onSubmit={handlePost} className="relative">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={taskId ? "Discuss this task..." : "Message the team..."}
          className="w-full bg-white border border-slate-200 p-4 pr-16 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
        >
          Post
        </button>
      </form>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              No activity yet
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                comment.userId === currentUser?.id
                  ? "bg-blue-50/30 border-blue-100 ml-8"
                  : "bg-slate-50 border-slate-100 mr-8"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                  {comment.user?.email.split("@")[0]}
                </span>
                <span className="text-[9px] font-bold text-slate-400">
                  {new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
