export interface DailyTask {
  id: number; // Backend uses Long/number, not string
  text: string;
  isCompleted: boolean;
  createdAt: string; // ISO datetime string
  updatedAt?: string; // Optional, may not be present in response
}

export interface CreateTaskRequest {
  text: string;
}

export interface UpdateTaskRequest {
  text?: string;
  isCompleted?: boolean;
}

export interface TaskCountResponse {
  count: number;
  maxDailyTasks: number;
  remaining: number;
}

export interface CleanupResponse {
  message: string;
  expiredTasksFound: number;
  tasksDeleted: number;
}
