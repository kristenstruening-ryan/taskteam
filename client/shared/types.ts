export interface Task {
  id: string;
  content: string;
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
