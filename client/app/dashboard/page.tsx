"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import DeleteModal from "@/components/DeleteModal";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import {
  Plus,
  Layout,
  ArrowUpRight,
  Trash2,
  Sparkles,
  Zap,
} from "lucide-react";
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
      console.error("System Error: Could not load boards", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
    const savedName = localStorage.getItem("user_name");
    const savedUser = localStorage.getItem("user");

    if (savedName) {
      setUserName(savedName.split(" ")[0]);
    } else if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.name?.split(" ")[0] || "");
      } catch (e) {
        console.error("Local Storage Error", e);
      }
    }
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
      console.error("Failed to initialize board", err);
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <div className="p-10 max-w-7xl mx-auto relative">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 relative z-10">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-indigo-400 fill-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/70">
                Operational Dashboard
              </span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter antialiased">
              {userName ? `Welcome, ${userName}` : "Control Center"}
            </h1>
            <p className="text-slate-500 mt-3 font-bold text-sm">
              {boards.length > 0
                ? `System active with ${boards.length} live project units.`
                : "Awaiting workspace initialization."}
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="group bg-white text-[#0f172a] hover:bg-indigo-50 px-8 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-3"
          >
            <Plus size={18} strokeWidth={3} />
            Initialize Board
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <DashboardSkeleton />
        ) : boards.length === 0 && !isCreating ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 bg-[#1e293b]/30 rounded-[4rem] border-2 border-dashed border-slate-800 animate-in fade-in zoom-in-95 backdrop-blur-sm">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-8 shadow-2xl shadow-indigo-500/10">
              <Sparkles size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              No Active Missions
            </h3>
            <p className="text-slate-500 mt-3 mb-10 font-bold text-center max-w-sm leading-relaxed">
              Initialize your first project board to start tracking tasks and
              syncing with your team units.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-slate-700"
            >
              Get Started
            </button>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
            {isCreating && (
              <form
                onSubmit={handleCreateBoard}
                className="p-10 border-2 border-dashed border-indigo-500/30 rounded-[3.5rem] bg-indigo-500/5 flex flex-col justify-center animate-in fade-in zoom-in-95 backdrop-blur-xl h-full min-h-70"
              >
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 ml-2">
                  New Board Identity
                </label>
                <input
                  autoFocus
                  className="bg-[#0f172a] border-2 border-slate-800 p-5 rounded-2xl text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-bold shadow-inner"
                  placeholder="Mission Name..."
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                />
                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-[#0f172a] py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-50 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 bg-slate-800 text-slate-400 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {boards.map((board) => (
              <div
                key={board.id}
                className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700"
              >
                <Link
                  href={`/project/${board.id}`}
                  className="block p-12 bg-[#1e293b] border-2 border-slate-800 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-indigo-500/10 hover:border-indigo-500/40 transition-all relative overflow-hidden h-full min-h-70"
                >
                  <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors">
                    <Layout size={80} strokeWidth={1} />
                  </div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-[#0f172a] rounded-2xl border border-slate-800 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                      <Layout size={20} strokeWidth={2.5} />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-4 tracking-tighter group-hover:text-indigo-300 transition-colors leading-tight">
                      {board.title}
                    </h2>

                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                      <span>Open Portal</span>
                      <ArrowUpRight
                        size={14}
                        className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                        strokeWidth={3}
                      />
                    </div>
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setBoardToDelete(board);
                  }}
                  className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 p-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all z-20 border border-rose-500/20"
                >
                  <Trash2 size={16} strokeWidth={2.5} />
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
