import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import taskService from '../services/taskService';
import { CreateTaskRequest, DailyTask, UpdateTaskRequest } from '../types/task';
import { useAuth } from './AuthContext';

interface TasksContextType {
  // State
  todayTasks: DailyTask[];
  tasksLoading: boolean;
  tasksError: string | null;

  // Operations
  createTask: (taskData: CreateTaskRequest) => Promise<DailyTask>;
  updateTask: (taskId: number, taskData: UpdateTaskRequest) => Promise<DailyTask>;
  deleteTask: (taskId: number) => Promise<void>;
  clearAllTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  clearError: () => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  const loadTodayTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setTasksLoading(true);
      setTasksError(null);
      
      const tasks = await taskService.getTodayTasks();
      setTodayTasks(tasks);
    } catch (error: any) {
      console.error('Failed to load today tasks:', error);
      setTasksError(error.message || 'Failed to load tasks');
      setTodayTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [isAuthenticated]);

  // Load tasks when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTodayTasks();
    } else {
      setTodayTasks([]);
    }
  }, [isAuthenticated, loadTodayTasks]);

  const createTask = async (taskData: CreateTaskRequest): Promise<DailyTask> => {
    try {
      setTasksError(null);
      
      const newTask = await taskService.createTask(taskData);
      setTodayTasks(prev => [...prev, newTask]);
      
      return newTask;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      setTasksError(error.message || 'Failed to create task');
      throw error;
    }
  };

  const updateTask = async (taskId: number, taskData: UpdateTaskRequest): Promise<DailyTask> => {
    try {
      setTasksError(null);
      
      const updatedTask = await taskService.updateTask(taskId, taskData);
      setTodayTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      return updatedTask;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      setTasksError(error.message || 'Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (taskId: number): Promise<void> => {
    try {
      setTasksError(null);
      
      await taskService.deleteTask(taskId);
      setTodayTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      setTasksError(error.message || 'Failed to delete task');
      throw error;
    }
  };

  const clearAllTasks = async (): Promise<void> => {
    try {
      setTasksError(null);
      
      // Delete all tasks one by one
      const deletePromises = todayTasks.map(task => taskService.deleteTask(task.id));
      await Promise.all(deletePromises);
      
      setTodayTasks([]);
    } catch (error: any) {
      console.error('Failed to clear all tasks:', error);
      setTasksError(error.message || 'Failed to clear tasks');
      throw error;
    }
  };

  const refreshTasks = useCallback(async () => {
    await loadTodayTasks();
  }, [loadTodayTasks]);

  const clearError = () => {
    setTasksError(null);
  };

  const value: TasksContextType = {
    todayTasks,
    tasksLoading,
    tasksError,
    createTask,
    updateTask,
    deleteTask,
    clearAllTasks,
    refreshTasks,
    clearError,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
