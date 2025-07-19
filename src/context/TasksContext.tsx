import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CreateTaskRequest, DailyTask, UpdateTaskRequest } from '../types/task';
import taskService from '../services/taskService';

interface TasksContextType {
  // State
  todayTasks: DailyTask[];
  tasksLoading: boolean;
  tasksError: string | null;

  // Operations
  createTask: (taskData: CreateTaskRequest) => Promise<DailyTask>;
  updateTask: (taskId: number, taskData: UpdateTaskRequest) => Promise<DailyTask>;
  toggleTaskCompletion: (taskId: number) => Promise<DailyTask>;
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

  const loadTodayTasks = useCallback(async () => {
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
  }, []);

  const createTask = async (taskData: CreateTaskRequest): Promise<DailyTask> => {
    try {
      setTasksError(null);
      
      const newTask = await taskService.createTask(taskData);
      setTodayTasks(prevTasks => [...prevTasks, newTask]);
      
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
      
      setTodayTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
      
      return updatedTask;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      setTasksError(error.message || 'Failed to update task');
      throw error;
    }
  };

  const toggleTaskCompletion = async (taskId: number): Promise<DailyTask> => {
    try {
      setTasksError(null);
      
      const updatedTask = await taskService.toggleTaskCompletion(taskId);
      
      setTodayTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
      
      return updatedTask;
    } catch (error: any) {
      console.error('Failed to toggle task completion:', error);
      setTasksError(error.message || 'Failed to toggle task');
      throw error;
    }
  };

  const deleteTask = async (taskId: number): Promise<void> => {
    try {
      setTasksError(null);
      
      await taskService.deleteTask(taskId);
      setTodayTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      setTasksError(error.message || 'Failed to delete task');
      throw error;
    }
  };

  const clearAllTasks = async (): Promise<void> => {
    try {
      setTasksError(null);
      
      // Delete each task individually since there's no bulk delete endpoint
      const deletePromises = todayTasks.map(task => taskService.deleteTask(task.id));
      await Promise.all(deletePromises);
      
      setTodayTasks([]);
    } catch (error: any) {
      console.error('Failed to clear all tasks:', error);
      setTasksError(error.message || 'Failed to clear tasks');
      throw error;
    }
  };

  const refreshTasks = async (): Promise<void> => {
    await loadTodayTasks();
  };

  const clearError = () => {
    setTasksError(null);
  };

  // Load tasks on mount
  useEffect(() => {
    loadTodayTasks();
  }, [loadTodayTasks]);

  const value: TasksContextType = {
    todayTasks,
    tasksLoading,
    tasksError,
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    clearAllTasks,
    refreshTasks,
    clearError,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

export default TasksContext;
