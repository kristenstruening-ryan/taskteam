"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import type { Board, Task, BoardMember, User } from "../../../shared/types";
import TaskSidebar from "@/components/TaskSidebar";
import Toast from "@/components/Toast";
import DeleteModal from "@/components/DeleteModal";
import MemberSidebar from "@/components/MemberSidebar";
import BoardChatSidebar from "@/components/BoardChatSidebar";
import axios from "axios";

const COLUMNS = ["todo", "in-progress", "done"];

const COLUMN_THEMES: Record<
  string,
  { bg: string; border: string; accent: string; dot: string }
> = {
  todo: {
    bg: "bg-slate-100/50",
    border: "border-slate-200",
    accent: "text-slate-500",
    dot: "bg-slate-400",
  },
  "in-progress": {
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    accent: "text-blue-600",
    dot: "bg-blue-500",
  },
  done: {
    bg: "bg-emerald-50/40",
    border: "border-emerald-100",
    accent: "text-emerald-600",
    dot: "bg-emerald-500",
  },
};

export default function BoardDetail() {
  const { id } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [newTasks, setNewTasks] = useState<{ [key: string]: string }>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMemberSidebarOpen, setIsMemberSidebarOpen] = useState(false);
  const [isBoardChatOpen, setIsBoardChatOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [members, setMembers] = useState<BoardMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const closeAllOverlays = useCallback(() => {
    setSelectedTask(null);
    setIsBoardChatOpen(false);
    setIsMemberSidebarOpen(false);
    setShowInvite(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAllOverlays();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAllOverlays]);

  const getInitial = (
    user: string | { name?: string | null; email?: string } | null | undefined,
  ): string => {
    if (!user) return "U";
    if (typeof user === "string") return user.charAt(0).toUpperCase() || "U";
    const identifier = user.name || user.email || "U";
    return identifier.charAt(0).toUpperCase();
  };

  const fetchBoardData = useCallback(async () => {
    try {
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data);
      setMembers(res.data.members || []);
    } catch (err) {
      setToast({ message: "Failed to load board data.", type: "error" });
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const isOwner = board?.userId === currentUser?.id;

  const isOverdue = (dateString?: string | null) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const handleInviteMember = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await api.post(`/boards/${id}/members`, { email: inviteEmail });
      setInviteEmail("");
      setShowInvite(false);
      fetchBoardData();
      setToast({ message: "Member invited successfully!", type: "success" });
    } catch (error: unknown) {
      let errorMsg = "User not found or already a member.";
      if (axios.isAxiosError(error))
        errorMsg = error.response?.data?.message || errorMsg;
      setToast({ message: errorMsg, type: "error" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateDescription = async (
    taskId: string,
    description: string,
  ) => {
    try {
      await api.patch(`/tasks/${taskId}`, { description });
      setBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, description } : t,
          ),
        };
      });
      setToast({ message: "Description saved.", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to update description.", type: "error" });
      console.error(error);
    }
  };

  const handleCreateTask = async (columnId: string) => {
    const content = newTasks[columnId];
    if (!content?.trim()) return;
    try {
      const res = await api.post("/tasks", { content, columnId, boardId: id });
      setBoard((prev) =>
        prev ? { ...prev, tasks: [...prev.tasks, res.data] } : null,
      );
      setNewTasks({ ...newTasks, [columnId]: "" });
    } catch (error) {
      setToast({ message: "Failed to create task.", type: "error" });
      console.error(error);
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${taskToDelete.id}`);
      setBoard((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.filter((t) => t.id !== taskToDelete.id),
            }
          : null,
      );
      if (selectedTask?.id === taskToDelete.id) setSelectedTask(null);
      setToast({ message: "Task deleted.", type: "success" });
    } catch (error) {
      setToast({ message: "Delete failed.", type: "error" });
      console.error(error);
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsDeleting(true);
    try {
      await api.delete(`/boards/${id}/members/${memberToRemove}`);
      setMembers((prev) => prev.filter((m) => m.userId !== memberToRemove));
      setToast({ message: "Member removed from project.", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to remove member.", type: "error" });
      console.error(error);
    } finally {
      setIsDeleting(false);
      setMemberToRemove(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !board) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const updatedTasks = Array.from(board.tasks);
    const taskIndex = updatedTasks.findIndex((t) => t.id === draggableId);
    const [movedTask] = updatedTasks.splice(taskIndex, 1);
    movedTask.columnId = destination.droppableId;
    updatedTasks.splice(destination.index, 0, movedTask);
    setBoard({ ...board, tasks: updatedTasks });

    try {
      await api.post(`/tasks/move`, {
        taskId: draggableId,
        newColumnId: destination.droppableId,
        newOrder: destination.index,
      });
    } catch (err) {
      setToast({ message: "Sync error. Please refresh.", type: "error" });
      console.error(err);
    }
  };

  if (!board)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 relative overflow-x-hidden">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <DeleteModal
        isOpen={!!taskToDelete}
        title={taskToDelete?.content || "this task"}
        confirmText="Delete Task"
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDeleteTask}
        loading={isDeleting}
      />

      <DeleteModal
        isOpen={!!memberToRemove}
        title="this team member"
        description="They will immediately lose access to this board and all its tasks."
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        confirmText="Remove Member"
        loading={isDeleting}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            {board.title}
          </h1>
          <div className="flex items-center mt-6 gap-4 flex-wrap">
            <div className="flex -space-x-2 mr-2">
              {members.map((m) => (
                <button
                  key={m.userId}
                  onClick={() => {
                    closeAllOverlays();
                    setIsMemberSidebarOpen(true);
                  }}
                  title={m.user.name || m.user.email}
                  className="w-9 h-9 rounded-full border-2 border-slate-50 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-200 hover:scale-110 hover:z-10 transition-all cursor-pointer"
                >
                  {getInitial(m.user)}
                </button>
              ))}
            </div>

            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Filter tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-48 md:w-64 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
                >
                  <span className="text-[10px]">✕</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                closeAllOverlays();
                setIsBoardChatOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all shadow-sm"
            >
              <span className="text-base">💬</span>
              Team Chat
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all"
              >
                +
              </button>
              {showInvite && (
                <form
                  onSubmit={handleInviteMember}
                  className="animate-in fade-in slide-in-from-left-2"
                >
                  <input
                    autoFocus
                    type="email"
                    placeholder="Invite by email..."
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                  />
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar min-h-[calc(100vh-280px)]">
          {COLUMNS.map((colId) => {
            const theme = COLUMN_THEMES[colId];
            const filteredTasks = board.tasks
              .filter((t) => t.columnId === colId)
              .filter((t) =>
                t.content.toLowerCase().includes(searchTerm.toLowerCase()),
              );

            return (
              <div
                key={colId}
                className={`w-80 flex shrink-0 flex-col p-4 rounded-3xl border ${theme.bg} ${theme.border}`}
              >
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className={`w-2 h-2 rounded-full ${theme.dot}`} />
                  <h3
                    className={`uppercase font-black text-[10px] tracking-[0.2em] ${theme.accent}`}
                  >
                    {colId.replace("-", " ")}
                  </h3>
                </div>

                <Droppable droppableId={colId}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex-1 min-h-37.5"
                    >
                      {filteredTasks.length === 0 && searchTerm ? (
                        <div className="py-10 text-center opacity-30">
                          <p className="text-[10px] font-black uppercase tracking-widest">
                            No Matches
                          </p>
                        </div>
                      ) : (
                        filteredTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => {
                                  closeAllOverlays();
                                  setSelectedTask(task);
                                }}
                                className="bg-white p-5 rounded-2xl shadow-sm mb-3 border border-slate-100 relative group hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer"
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex justify-between items-start gap-3">
                                    <span className="font-bold text-slate-700 text-sm leading-snug">
                                      {task.content}
                                    </span>
                                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                                      <span>💬</span>
                                      {task.comments?.length || 0}
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-[9px] flex items-center justify-center font-black border border-blue-100 shrink-0 uppercase">
                                      {getInitial(task.assignedUser)}
                                    </div>
                                  </div>

                                  {task.dueDate && (
                                    <div
                                      className={`self-start inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                        isOverdue(task.dueDate)
                                          ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                                          : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
                                      }`}
                                    >
                                      <span>
                                        {isOverdue(task.dueDate) ? "⏰" : "📅"}
                                      </span>
                                      {formatDate(task.dueDate)}
                                      {isOverdue(task.dueDate) && " • Overdue"}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTaskToDelete(task);
                                  }}
                                  className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="+ Add a task..."
                    className="w-full p-4 text-sm rounded-2xl border border-white bg-white/50 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={newTasks[colId] || ""}
                    onChange={(e) =>
                      setNewTasks({ ...newTasks, [colId]: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateTask(colId)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {isMemberSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-140 animate-in fade-in duration-300"
            onClick={() => setIsMemberSidebarOpen(false)}
          />
          <MemberSidebar
            isOpen={isMemberSidebarOpen}
            onClose={() => setIsMemberSidebarOpen(false)}
            members={members}
            onRemoveMember={(memberId) => setMemberToRemove(memberId)}
            isOwner={isOwner}
          />
        </>
      )}

      {selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-90 animate-in fade-in duration-300"
            onClick={() => setSelectedTask(null)}
          />
          <TaskSidebar
            key={selectedTask.id}
            task={selectedTask}
            currentUser={currentUser}
            members={members}
            onClose={() => setSelectedTask(null)}
            onUpdateTask={fetchBoardData}
            onUpdateDescription={handleUpdateDescription}
          />
        </>
      )}

      {isBoardChatOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-105 animate-in fade-in duration-300"
            onClick={() => setIsBoardChatOpen(false)}
          />
          <BoardChatSidebar
            boardId={id as string}
            currentUser={currentUser}
            onClose={() => setIsBoardChatOpen(false)}
          />
        </>
      )}
    </div>
  );
}
