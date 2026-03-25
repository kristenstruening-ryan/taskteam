"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Task, Comment } from "@/shared/types";

interface TaskSidebarProps {
  task: Task;
  onClose: () => void;
  onUpdateDescription: (taskId: string, desc: string) => void;
}

export default function TaskSidebar({
  task,
  onClose,
  onUpdateDescription,
}: TaskSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const fetchComments = useCallback(async () => {
    if (!task?.id) return;
    try {
      const res = await api.get(`/comments/${task.id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Fetch comments failed", err);
    }
  }, [task.id]);

  useEffect(() => {
    let isIgnore = false;
    const load = async () => {
      if (!isIgnore) await fetchComments();
    };
    load();
    return () => {
      isIgnore = true;
    };
  }, [fetchComments]);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.post(`/comments/${task.id}`, { content: commentText });
      setCommentText("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      await api.patch(`/comments/${commentId}`, { content: editText });
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 p-6 flex flex-col animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Task Details</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-2xl"
        >
          ✕
        </button>
      </div>

      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
        Description
      </label>
      <textarea
        className="mt-2 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-40 outline-none resize-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        placeholder="Add details..."
        defaultValue={task.description || ""}
        onBlur={(e) => onUpdateDescription(task.id, e.target.value)}
      />

      <div className="mt-8 flex flex-col flex-1 overflow-hidden">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
          Discussion
        </label>

        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">
              No comments yet.
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-xl border ${c.isDeleted ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-sm"}`}
              >
                <div className="flex justify-between mb-1 items-center">
                  <span className="text-[10px] font-bold text-blue-600">
                    {c.user?.email || "Team Member"}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.isEdited && !c.isDeleted && (
                      <span className="text-[9px] text-slate-400 italic">
                        (edited)
                      </span>
                    )}
                    <span className="text-[9px] text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString()}
                    </span>
                    {!c.isDeleted && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingCommentId(c.id);
                            setEditText(c.content);
                          }}
                          className="text-slate-300 hover:text-blue-500 text-xs"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-slate-300 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editingCommentId === c.id ? (
                  <div className="mt-2">
                    <textarea
                      className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-[10px] font-bold text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateComment(c.id)}
                        className="text-[10px] font-bold text-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`text-sm leading-relaxed ${c.isDeleted ? "text-slate-400 italic" : "text-slate-700"}`}
                  >
                    {c.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 relative">
          <input
            type="text"
            className="w-full p-3 pr-12 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
            placeholder="Write a comment..."
          />
          <button
            onClick={handlePostComment}
            className="absolute right-2 top-1.5 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
