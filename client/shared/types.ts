import { DropResult } from "@hello-pangea/dnd";

/* --- Core Identity Types --- */
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthUser extends User {
  systemRole: "admin" | "user";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/* --- Project & Board Types --- */
export interface Board {
  id: string;
  title: string;
  userId: string;
  tasks: Task[];
  members: BoardMember[];
}

export interface BoardSummary {
  id: string;
  title: string;
}

export interface BoardMember {
  userId: string;
  role: string;
  user: User;
}

export interface Phase {
  id: string;
  boardId: string;
  title: string;
  status: "pending" | "active" | "completed";
  dueDate?: string | null;
  order: number;
  createdAt?: string;
}

/* --- Task & Communication Types --- */
export interface Task {
  id: string;
  content: string;
  description?: string | null;
  boardId: string;
  assignedUser?: User | string;
  attachments?: Attachment[] | null;
  comments: Comment[];
  columnId: string;
  order: number;
  dueDate?: string | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  isDeleted: boolean;
  isEdited: boolean;
  user?: {
    email: string;
    name?: string;
  };
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  createdAt: string;
}

/* --- Admin & System Types --- */
export interface AccessRequest {
  id: string;
  targetEmail: string;
  boardId: string;
  requesterId: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  email: string;
  action: "approved" | "denied";
  timestamp: string;
  adminName: string;
}

export interface NotificationItem {
  id: string;
  senderEmail: string;
  isRead: boolean;
  createdAt: string;
  type: "mention" | "access_request" | "request_approved" | "request_denied";
  content: string | null;
  commentContent?: string | null;
  taskId?: string;
  boardId?: string;
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  meetingLink?: string;
}

/* --- Component Prop Interfaces --- */
export interface AttachmentModalProps {
  onClose: () => void;

  context: { type: "task" | "board" | "chat"; id: string };

  onSuccess: (attachment: Attachment) => void;
}

export interface AttachmentGalleryProps {
  attachments: Attachment[];

  onDelete: (id: string) => void;
}

export interface CreateTaskModalProps {
  isOpen: boolean;

  onClose: () => void;

  onCreate: (columnId: string, content: string) => void;
}

export interface PhaseWithTasks extends Phase {
  tasks?: Task[];
}

export interface ProjectNewsFeedProps {
  unreadMentions: number;
  velocity: number;
  onMarkRead: () => void;
}

export interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  variant?: "danger" | "warning";
  description?: string;
  confirmText?: string;
  requireConfirmationText?: string;
}

export interface KanbanBoardProps {
  tasks: Task[];

  searchTerm: string;

  setSearchTerm: (val: string) => void;

  onDragEnd: (result: DropResult) => void;

  onTaskClick: (task: Task) => void;

  onDeleteTask: (task: Task) => void;

  onCreateTask: (columnId: string, content: string) => void;
}

export interface ColumnTheme {
  bg: string;

  border: string;

  accent: string;

  dot: string;
}

export interface InviteModalProps {
  boardId: string;

  onClose: () => void;
}

export interface TaskCardProps {
  task: Task;

  index: number;

  onClick: () => void;

  onDelete: (e: React.MouseEvent) => void;
}
export interface MemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  members: BoardMember[];
  onRemoveMember: (userId: string) => void;
  isOwner: boolean;
  currentUserId?: string;
}

export interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  phases: Phase[];
  onRefresh: () => void;
}

export interface ProjectHeaderProps {
  title: string;
  boardId: string;
  members: BoardMember[];
  onOpenMembers: () => void;
  onOpenChat: () => void;
  onOpenMeetingModal: () => void;
  onInvite: (email: string) => Promise<void>;
  hasNewMessages?: boolean;
}

export interface KanbanBoardProps {
  tasks: Task[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onDragEnd: (result: DropResult) => void;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCreateTask: (columnId: string, content: string) => void;
}

export interface TaskSidebarProps {
  task: Task;
  currentUser: User | null;
  members: BoardMember[];
  onClose: () => void;
  onUpdateDescription: (taskId: string, desc: string) => void;
  onUpdateTask: () => void;
}

export interface ProjectChatSidebarProps {
  boardId: string;
  currentUser: User | null;
  onClose: () => void;
}

export interface CommentListProps {
  boardId: string;
  taskId?: string;
  currentUser: User | null;
}

export interface TaskUpdatePayload {
  boardId: string;
  taskId: string;
  content?: string;
  columnId?: string;
}
