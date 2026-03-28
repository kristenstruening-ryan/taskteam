export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthUser extends User {
  systemRole: "admin" | "user";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface BoardMember {
  userId: string;
  role: string;
  user: User;
}
export interface Task {
  id: string;
  content: string;
  description?: string | null;
  boardId: string;
  assignedUser?: User | string;
  comments: Comment[];
  columnId: string;
  order: number;
  dueDate?: string | null;
}

export interface Board {
  id: string;
  title: string;
  userId: string;
  tasks: Task[];
}

export interface BoardSummary {
  id: string;
  title: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user?: { email: string };
  isDeleted: boolean;
  isEdited: boolean;
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

export interface MemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  members: BoardMember[];
  onRemoveMember: (memberId: string) => void;
  isOwner: boolean;
}

export interface TaskSidebarProps {
  task: Task;
  currentUser: User | null;
  members: BoardMember[];
  onClose: () => void;
  onUpdateDescription: (taskId: string, desc: string) => void;
  onUpdateTask: () => void;
}

export interface AccessRequest {
  id: string;
  targetEmail: string;
  boardId: string;
  requesterId: string;
  status: string;
  createdAt: string;
}

export interface AuthResonse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    systemRole: string;
  };
}

export interface ActivityLog {
  id: string;
  email: string;
  action: "approved" | "denied";
  timestamp: string;
  adminName: string;
}