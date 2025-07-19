import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CreateTaskRequest, DailyTask, UpdateTaskRequest } from '../types/task';

interface TasksContextType {
  // State
  todayTasks: DailyTask[];
  tasksLoading: boolean;
  tasksError: string | null;

  // Operations
  createTask: (taskData: CreateTaskRequest) => Promise<DailyTask>;
  updateTask: (taskId: string, taskData: UpdateTaskRequest) => Promise<DailyTask>;
  deleteTask: (taskId: string) => Promise<void>;
  clearAllTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  clearError: () => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getStorageKey = (date: string) => `daily_tasks_${date}`;

  const loadTodayTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      
      const today = getTodayDateString();
      const storageKey = getStorageKey(today);
      const tasksJson = await AsyncStorage.getItem(storageKey);
      
      if (tasksJson) {
        const tasks: DailyTask[] = JSON.parse(tasksJson);
        setTodayTasks(tasks);
      } else {
        setTodayTasks([]);
      }
    } catch (error: any) {
      console.error('Failed to load today tasks:', error);
      setTasksError(error.message || 'Failed to load tasks');
      setTodayTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const saveTasks = useCallback(async (tasks: DailyTask[], date: string) => {
    try {
      const storageKey = getStorageKey(date);
      await AsyncStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
      throw error;
    }
  }, []);

  const createTask = async (taskData: CreateTaskRequest): Promise<DailyTask> => {
    try {
      setTasksError(null);
      
      const today = getTodayDateString();
      const now = new Date().toISOString();
      
      const newTask: DailyTask = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: taskData.text.trim(),
        date: today,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      const updatedTasks = [...todayTasks, newTask];
      await saveTasks(updatedTasks, today);
      setTodayTasks(updatedTasks);
      
      return newTask;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      setTasksError(error.message || 'Failed to create task');
      throw error;
    }
  };

  const updateTask = async (taskId: string, taskData: UpdateTaskRequest): Promise<DailyTask> => {
    try {
      setTasksError(null);
      
      const today = getTodayDateString();
      const now = new Date().toISOString();
      
      const updatedTasks = todayTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            ...taskData,
            updatedAt: now,
          };
        }
        return task;
      });

      const updatedTask = updatedTasks.find(task => task.id === taskId);
      if (!updatedTask) {
        throw new Error('Task not found');
      }

      await saveTasks(updatedTasks, today);
      setTodayTasks(updatedTasks);
      
      return updatedTask;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      setTasksError(error.message || 'Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      setTasksError(null);
      
      const today = getTodayDateString();
      const updatedTasks = todayTasks.filter(task => task.id !== taskId);
      
      await saveTasks(updatedTasks, today);
      setTodayTasks(updatedTasks);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      setTasksError(error.message || 'Failed to delete task');
      throw error;
    }
  };

  const clearAllTasks = async (): Promise<void> => {
    try {
      setTasksError(null);
      
      const today = getTodayDateString();
      await saveTasks([], today);
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
