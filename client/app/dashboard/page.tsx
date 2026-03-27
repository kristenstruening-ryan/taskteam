"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import DeleteModal from "@/components/DeleteModal";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import type { BoardSummary } from "../../shared/types";

export default function DashboardPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<BoardSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBoards = useCallback(async () => {
    try {
      const res = await api.get("/boards");
      setBoards(res.data);
    } catch (err) {
      console.error("Could not load boards", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName.split(" ")[0]);
  }, [fetchBoards]);

  const handleCreateBoard = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      await api.post("/boards", { title: newBoardTitle });
      setNewBoardTitle("");
      setIsCreating(false);
      fetchBoards();
    } catch (err) {
      console.error("Failed to create board", err);
    }
  };

  const handleDelete = async () => {
    if (!boardToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/boards/${boardToDelete.id}`);
      setBoardToDelete(null);
      fetchBoards();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900">
      <div className="p-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              {userName ? `Welcome back, ${userName}` : "My Boards"}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {boards.length > 0
                ? `You have ${boards.length} active projects.`
                : "Select a project to start collaborating."}
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/30 transition-all active:scale-95"
          >
            + Create New Board
          </button>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isCreating && (
              <form
                onSubmit={handleCreateBoard}
                className="p-8 border-2 border-dashed border-blue-200 rounded-[2.5rem] bg-blue-50/30 flex flex-col justify-center animate-in fade-in zoom-in-95 backdrop-blur-sm h-50"
              >
                <input
                  autoFocus
                  className="bg-white border border-slate-200 p-4 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="Board Title..."
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                />
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Create</button>
                  <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-white border border-slate-200 text-slate-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            )}

            {boards.map((board) => (
              <div key={board.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Link
                  href={`/board/${board.id}`}
                  className="block p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all relative overflow-hidden h-full min-h-50"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                  <h2 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{board.title}</h2>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <span>Open Project</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); setBoardToDelete(board); }}
                  className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all z-20 shadow-sm"
                >
                  <span className="text-xs">🗑️</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <DeleteModal
          isOpen={!!boardToDelete}
          title={boardToDelete?.title || ""}
          variant="warning"
          confirmText="Delete Board"
          onClose={() => setBoardToDelete(null)}
          onConfirm={handleDelete}
          loading={isDeleting}
        />
      </div>
    </div>
  );
}