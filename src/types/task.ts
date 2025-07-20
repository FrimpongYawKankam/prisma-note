export interface DailyTask {
  id: number;          // Backend uses number, not string
  text: string;        // max 500 chars
  isCompleted: boolean;
  createdAt: string;   // ISO timestamp
}

export interface CreateTaskRequest {
  text: string;        // required, max 500 chars
}

export interface UpdateTaskRequest {
  text: string;        // required, max 500 chars (backend doesn't support partial text updates)
}

// Additional types for API responses
export interface TaskResponse {
  id: number;
  text: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface TaskCountResponse {
  count: number;
  maxDailyTasks: number;
  remaining: number;
}

export interface TaskCleanupResponse {
  message: string;
  expiredTasksFound: number;
  tasksDeleted: number;
}
