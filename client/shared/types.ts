export interface Task {
  id: string;
  content: string;
  description?: string | null;
  boardId: string;
  assignedTo?: User | string | null;
  columnId: string;
  order: number;
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

export interface User {
  id: string;
  email: string;
  name: string;
}


export interface NotificationItem {
  id: string;
  senderEmail: string;
  commentContent: string;
  isRead: boolean;
  createdAt: string;
}

export interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}