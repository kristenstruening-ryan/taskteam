"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import type {
  Board,
  Task,
  User,
  BoardMember,
  TaskUpdatePayload,
  Phase,
} from "../../../shared/types";
import { useSuccess } from "@/hooks/useSuccess";
import { DropResult } from "@hello-pangea/dnd";
import { Loader2, ShieldAlert } from "lucide-react";
import { io } from "socket.io-client";

// Components
import ProjectHeader from "@/components/ProjectHeader";
import KanbanBoard from "@/components/KanbanBoard";
import ProjectNewsContainer from "@/components/ProjectNewsContainer";
import MeetingCreationModal from "@/components/MeetingCreationModal";
import TaskSidebar from "@/components/TaskSidebar";
import Toast from "@/components/Toast";
import DeleteModal from "@/components/DeleteModal";
import MemberSidebar from "@/components/MemberSidebar";
import ProjectChatSidebar from "@/components/ProjectChatSidebar";
import PhaseManagerModal from "@/components/PhaseManagerModal";
import VelocityCard from "@/components/VelocityCard";

interface ExtendedBoard extends Board {
  members: BoardMember[];
}

export default function ProjectHub() {
  const params = useParams();
  const { fire } = useSuccess();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [board, setBoard] = useState<ExtendedBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const lastCheckedRef = useRef<number>(Date.now());
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isMemberSidebarOpen, setIsMemberSidebarOpen] = useState(false);
  const [isBoardChatOpen, setIsBoardChatOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    globalVelocity: number;
    currentPhase: { title: string; progress: number; status: string } | null;
  } | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [newsKey, setNewsKey] = useState(0);

  const fetchBoardData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data);
    } catch (err) {
      console.error("Telemetry Sync Error:", err);
      setToast({ message: "Failed to sync board telemetry.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id]);
  const fetchMetrics = useCallback(async () => {
    if (!id) return;
    const [metricsRes, phasesRes] = await Promise.all([
      api.get(`/projectBoard/stats/${id}`),
      api.get(`/phases/board/${id}`),
    ]);
    setMetrics(metricsRes.data);
    setPhases(phasesRes.data);
  }, [id]);
  useEffect(() => {
    if (id) fetchBoardData();
    fetchMetrics();
  }, [id, fetchBoardData, fetchMetrics]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Identity parse error", e);
      }
    }
  }, []);

  // Real-time Websocket Logic
  useEffect(() => {
    if (!id) return;

    socketRef.current = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    );

    const socket = socketRef.current;

    socket.emit("join-board", id);

    socket.on("task-updated", (data: TaskUpdatePayload) => {
      console.log(
        `Remote Movement Detected: Task ${data.taskId} moved on Board ${data.boardId}`,
      );

      fetchBoardData();
      fetchMetrics();
      setToast({
        message: "Sync Complete: Board state updated by remote unit.",
        type: "success",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [id, fetchBoardData, fetchMetrics]);

  useEffect(() => {
    if (!id || isBoardChatOpen) return;
    const checkNewMessages = async () => {
      try {
        const res = await api.get(`/comments/board/${id}`);
        const comments = res.data;
        if (comments?.length > 0) {
          const latestTime = new Date(
            comments[comments.length - 1].createdAt,
          ).getTime();
          if (latestTime > lastCheckedRef.current) setHasNewMessages(true);
        }
      } catch (e) {
        console.error("Comms check failed", e);
      }
    };
    const interval = setInterval(checkNewMessages, 15000);
    return () => clearInterval(interval);
  }, [id, isBoardChatOpen]);

  useEffect(() => {
    if (isBoardChatOpen) {
      setHasNewMessages(false);
      lastCheckedRef.current = Date.now();
    }
  }, [isBoardChatOpen]);

  const onDragEnd = async (result: DropResult) => {
  const { destination, source, draggableId } = result;

  if (!destination || !board || !currentUser) return;
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) return;

  const originalTasks = [...board.tasks];
  const updatedTasks = Array.from(board.tasks);
  const taskIdx = updatedTasks.findIndex((t) => t.id === draggableId);

  if (taskIdx === -1) {
    console.error("Task missing from local state");
    return;
  }

  const [movedTask] = updatedTasks.splice(taskIdx, 1);
  movedTask.columnId = destination.droppableId;
  updatedTasks.splice(destination.index, 0, movedTask);

  setBoard({ ...board, tasks: updatedTasks });

  try {
    await api.post(`/tasks/move`, {
      taskId: draggableId,
      newColumnId: destination.droppableId,
      newOrder: destination.index,
    });

    if (destination.droppableId === "done" && source.droppableId !== "done") {
      fire(2);
      setToast({ message: "Objective Secured. Great work!", type: "success" });
    }

    fetchMetrics();
    if (socketRef.current) {
      const payload: TaskUpdatePayload = {
        boardId: id as string,
        taskId: draggableId,
        columnId: destination.droppableId,
      };
      socketRef.current.emit("task-moved", payload);
    }
  } catch (err) {
    console.error("Sync Failure:", err);
    setBoard((prev) => (prev ? { ...prev, tasks: originalTasks } : null));
    setToast({
      message: "Security Protocol: Position sync failed. Reverting...",
      type: "error",
    });
  }
};

  const handleCreateTask = async (columnId: string, content: string) => {
    if (!content?.trim()) return;
    try {
      const res = await api.post("/tasks", { content, columnId, boardId: id });
      setBoard((prev) =>
        prev ? { ...prev, tasks: [...prev.tasks, res.data] } : null,
      );
      fetchMetrics();
      setToast({ message: "Unit deployed to board.", type: "success" });
      setNewsKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setToast({ message: "Deployment failed.", type: "error" });
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
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
      setToast({ message: "Unit successfully purged.", type: "success" });
      setNewsKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setToast({
        message: "Protocol Failure: Could not delete unit.",
        type: "error",
      });
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !id) return;
    try {
      await api.delete(`/boards/${id}/members/${memberToRemove}`);
      setBoard((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter((m) => m.userId !== memberToRemove),
            }
          : null,
      );
      setToast({ message: "Access revoked for target unit.", type: "success" });
      setNewsKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to revoke member access.", type: "error" });
    } finally {
      setMemberToRemove(null);
    }
  };

  const isOwner = currentUser?.id === board?.userId;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a]">
        <Loader2
          className="animate-spin text-indigo-500 mb-6"
          size={48}
          strokeWidth={1.5}
        />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
          Initialising Workspace Telemetry...
        </p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-12 text-center">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-4xl flex items-center justify-center mb-8 border border-rose-500/20">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">
          Project Void
        </h1>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="px-10 py-4 bg-white text-[#0f172a] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-2xl"
        >
          Return to Command
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 relative overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-indigo-500/5 blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 p-4 lg:p-10 max-w-450 mx-auto space-y-12 animate-in fade-in duration-700">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <ProjectHeader
          title={board.title}
          boardId={board.id}
          members={board.members}
          onOpenMembers={() => setIsMemberSidebarOpen(true)}
          onOpenChat={() => setIsBoardChatOpen(true)}
          onOpenMeetingModal={() => setIsMeetingModalOpen(true)}
          onInvite={async (email) => {
            await api.post(`/boards/${id}/members`, { email });
            fetchBoardData();
          }}
          hasNewMessages={hasNewMessages}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProjectNewsContainer
            boardId={id as string}
            newsKey={newsKey}
            velocity={metrics?.globalVelocity || 0}
          />

          <VelocityCard
            velocity={metrics?.globalVelocity || 0}
            currentPhase={metrics?.currentPhase || null}
            onOpenPhaseManager={() => setIsPhaseModalOpen(true)}
          />
        </div>
        {/* ------------------------------ */}

        <div className="pt-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Live Kanban Interface
            </span>
          </div>
          <KanbanBoard
            tasks={board.tasks}
            searchTerm={searchTerm}
            members={board.members}
            setSearchTerm={setSearchTerm}
            onDragEnd={onDragEnd}
            onTaskClick={setSelectedTask}
            onDeleteTask={setTaskToDelete}
            onCreateTask={handleCreateTask}
          />
        </div>
      </div>

      {/* Overlays / Modals */}
      <PhaseManagerModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        boardId={id as string}
        phases={phases}
        onRefresh={fetchMetrics}
      />

      <DeleteModal
        isOpen={!!memberToRemove}
        title="Revoke Member Access?"
        description="Target unit will lose all clearance levels for this coordinate."
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        confirmText="Revoke Access"
      />

      <DeleteModal
        isOpen={!!taskToDelete}
        title={`Purge "${taskToDelete?.content}"?`}
        description="This action will permanently delete this task from the system logs."
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDeleteTask}
        confirmText="Confirm Purge"
      />

      <MeetingCreationModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        boardId={id as string}
        onSuccess={() => setNewsKey((prev) => prev + 1)}
      />

      <MemberSidebar
        isOpen={isMemberSidebarOpen}
        onClose={() => setIsMemberSidebarOpen(false)}
        members={board.members}
        onRemoveMember={setMemberToRemove}
        isOwner={isOwner}
        currentUserId={currentUser?.id}
      />

      {selectedTask && (
        <TaskSidebar
          task={selectedTask}
          currentUser={currentUser}
          members={board.members}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={fetchBoardData}
          onUpdateDescription={async (taskId, desc) => {
            await api.patch(`/tasks/${taskId}`, { description: desc });
            fetchBoardData();
          }}
        />
      )}

      {isBoardChatOpen && currentUser && (
        <ProjectChatSidebar
          boardId={id as string}
          currentUser={currentUser}
          onClose={() => setIsBoardChatOpen(false)}
        />
      )}
    </div>
  );
}
