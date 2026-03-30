"use client";

import { useState, useMemo } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import type {
  KanbanBoardProps,
  ColumnTheme,
  BoardMember,
} from "../shared/types";
import {
  Search,
  Plus,
  ArrowRight,
  Target,
  XCircle,
  UserPlus,
} from "lucide-react";

const COLUMNS = ["todo", "in-progress", "done"];

const COLUMN_THEMES: Record<string, ColumnTheme> = {
  todo: {
    bg: "bg-slate-50/50 dark:bg-slate-900/20",
    border: "border-slate-200 dark:border-slate-800",
    accent: "text-slate-500",
    dot: "bg-slate-400",
  },
  "in-progress": {
    bg: "bg-indigo-50/30 dark:bg-indigo-950/10",
    border: "border-indigo-100 dark:border-indigo-900/30",
    accent: "text-indigo-600 dark:text-indigo-400",
    dot: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
  },
  done: {
    bg: "bg-emerald-50/30 dark:bg-emerald-950/10",
    border: "border-emerald-100 dark:border-emerald-900/30",
    accent: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  },
};

export default function KanbanBoard({
  tasks,
  searchTerm,
  setSearchTerm,
  members,
  onDragEnd,
  onTaskClick,
  onDeleteTask,
  onCreateTask,
}: KanbanBoardProps & { members: BoardMember[] }) {
  // filterUser can be a userId, "unassigned", or null
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isFiltered = searchTerm !== "" || filterUser !== null;

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterUser(null);
  };

  const localCompletion = useMemo(() => {
    if (tasks.length === 0) return 0;
    const doneTasks = tasks.filter((t) => t.columnId === "done").length;
    return Math.round((doneTasks / tasks.length) * 100);
  }, [tasks]);

  const suggestions = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return tasks
      .filter((t) => t.content.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
  }, [searchTerm, tasks]);

  return (
    <div className="space-y-10">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 gap-8">
        <div className="flex flex-1 items-center gap-4 max-w-2xl">
          <div className="relative flex-1 group z-50">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search
                className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                size={20}
              />
            </div>
            <input
              type="text"
              placeholder="Search board logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-[#f8fafc] dark:bg-[#0f172a] border-2 border-slate-100 dark:border-slate-800 rounded-4xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner"
            />

            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-3 z-60">
                {suggestions.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      onTaskClick(task);
                      setSearchTerm("");
                    }}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group"
                  >
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 truncate mr-4">
                      {task.content}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-slate-300 group-hover:text-indigo-500 transition-all"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-6 py-5 text-rose-500 hover:text-rose-400 font-black text-[10px] uppercase tracking-widest transition-all animate-in fade-in slide-in-from-left-4"
            >
              <XCircle size={18} />
              <span className="hidden sm:inline">Clear Filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-3 px-6 py-3 bg-slate-900/40 rounded-full border border-slate-800">
            <Target size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Board Sync: <span className="text-white">{localCompletion}%</span>
            </span>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => setFilterUser(null)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all ${!filterUser ? "bg-[#1e293b] text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
            >
              ALL
            </button>

            <button
              onClick={() => setFilterUser("unassigned")}
              className={`ml-2 px-4 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all flex items-center gap-2 ${filterUser === "unassigned" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
            >
              <UserPlus size={14} />
              OPEN
            </button>

            <div className="flex -space-x-2 ml-4 mr-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              {members?.map((m) => (
                <button
                  key={m.userId}
                  title={m.user.name}
                  onClick={() =>
                    setFilterUser(m.userId === filterUser ? null : m.userId)
                  }
                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-[11px] font-black text-white shadow-md ${filterUser === m.userId ? "border-indigo-500 ring-4 ring-indigo-500/20 scale-110 z-10" : "border-white dark:border-slate-900 bg-[#0f172a] hover:z-10"}`}
                >
                  {(m.user.name || "U").charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-4xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> New Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Horizontal scroll container for columns */}
        <div className="flex gap-8 overflow-x-auto pb-12 px-4 custom-scrollbar min-h-150 items-start">
          {COLUMNS.map((colId) => {
            const theme = COLUMN_THEMES[colId];

            // Apply filtering logic
            const processedTasks = tasks
              .filter((t) => t.columnId === colId)
              .filter((t) =>
                t.content.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .filter((t) => {
                if (!filterUser) return true;
                if (filterUser === "unassigned") return !t.assignedUser;

                // Handle both object-based and string-based assignedUser references
                const assignedId =
                  typeof t.assignedUser === "string"
                    ? t.assignedUser
                    : t.assignedUser?.id;

                return assignedId === filterUser;
              });

            return (
              <div
                key={colId}
                className={`w-90 flex shrink-0 flex-col p-8 rounded-[3.5rem] border backdrop-blur-sm transition-all duration-500 ${theme.bg} ${theme.border}`}
              >
                <div className="flex items-center justify-between mb-10 px-2">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${theme.dot}`} />
                    <h3
                      className={`uppercase font-black text-[12px] tracking-[0.25em] ${theme.accent}`}
                    >
                      {colId.replace("-", " ")}
                    </h3>
                  </div>
                  <span className="px-4 py-1.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black text-slate-400">
                    {processedTasks.length}
                  </span>
                </div>

                <Droppable droppableId={colId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 min-h-50 space-y-6 transition-colors rounded-3xl ${snapshot.isDraggingOver ? "bg-indigo-500/5" : ""}`}
                    >
                      {processedTasks.map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onClick={() => onTaskClick(task)}
                          onDelete={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task);
                          }}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onCreateTask}
      />
    </div>
  );
}
