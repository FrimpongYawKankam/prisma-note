import { CreateTaskRequest, DailyTask, TaskCleanupResponse, TaskCountResponse, UpdateTaskRequest } from '../types/task';
import axiosInstance from '../utils/axiosInstance';

class TaskService {
  /**
   * Get today's tasks for the authenticated user
   */
  async getTodayTasks(): Promise<DailyTask[]> {
    try {
      const response = await axiosInstance.get('/api/tasks/today');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch today\'s tasks:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskRequest): Promise<DailyTask> {
    try {
      const response = await axiosInstance.post('/api/tasks', taskData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: number, taskData: UpdateTaskRequest): Promise<DailyTask> {
    try {
      const response = await axiosInstance.put(`/api/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(taskId: number): Promise<DailyTask> {
    try {
      const response = await axiosInstance.put(`/api/tasks/${taskId}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to toggle task completion:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle task');
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  }

  /**
   * Clear all tasks for today (for admin/cleanup purposes)
   */
  async clearAllTasks(): Promise<void> {
    try {
      await axiosInstance.delete('/api/tasks/today');
    } catch (error: any) {
      console.error('Failed to clear all tasks:', error);
      throw new Error(error.response?.data?.message || 'Failed to clear tasks');
    }
  }

  /**
   * Get today's task count and limits
   */
  async getTodayTaskCount(): Promise<TaskCountResponse> {
    try {
      const response = await axiosInstance.get('/api/tasks/today/count');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch task count:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch task count');
    }
  }

  /**
   * Manual cleanup of expired tasks (admin endpoint)
   */
  async cleanupExpiredTasks(): Promise<TaskCleanupResponse> {
    try {
      const response = await axiosInstance.delete('/api/tasks/cleanup');
      return response.data;
    } catch (error: any) {
      console.error('Failed to cleanup expired tasks:', error);
      throw new Error(error.response?.data?.message || 'Failed to cleanup tasks');
    }
  }
}

const taskService = new TaskService();
export default taskService;
