export interface DailyTask {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  text: string;
}

export interface UpdateTaskRequest {
  text?: string;
  completed?: boolean;
}
