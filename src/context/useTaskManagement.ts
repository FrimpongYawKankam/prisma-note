import { useCallback } from 'react';
import { CreateTaskRequest, DailyTask } from '../types/task';
import { useTasks } from './TasksContext';
import { useTaskStats } from './TaskStatsContext';

/**
 * Enhanced task management hook that coordinates between tasks and statistics
 * This hook provides all task operations while automatically updating stats
 */
export const useTaskManagement = () => {
  const tasksContext = useTasks();
  const { incrementTasksCreated, incrementTasksCompleted, decrementTasksCompleted } = useTaskStats();

  // Enhanced createTask that updates stats
  const createTask = useCallback(async (taskData: CreateTaskRequest): Promise<DailyTask> => {
    const newTask = await tasksContext.createTask(taskData);
    
    // Update stats after successful task creation
    await incrementTasksCreated();
    
    return newTask;
  }, [tasksContext.createTask, incrementTasksCreated]);

  // Enhanced toggleTaskCompletion that updates stats
  const toggleTaskCompletion = useCallback(async (taskId: number): Promise<DailyTask> => {
    // Find the current task to check its completion status
    const currentTask = tasksContext.todayTasks.find(task => task.id === taskId);
    if (!currentTask) {
      throw new Error('Task not found');
    }

    const updatedTask = await tasksContext.toggleTaskCompletion(taskId);
    
    // Update completion stats based on the toggle
    if (updatedTask.isCompleted && !currentTask.isCompleted) {
      // Task was completed
      await incrementTasksCompleted();
    } else if (!updatedTask.isCompleted && currentTask.isCompleted) {
      // Task was uncompleted
      await decrementTasksCompleted();
    }
    
    return updatedTask;
  }, [tasksContext.toggleTaskCompletion, tasksContext.todayTasks, incrementTasksCompleted, decrementTasksCompleted]);

  // Return all the original task context methods plus enhanced versions
  return {
    // Original task context data
    todayTasks: tasksContext.todayTasks,
    tasksLoading: tasksContext.tasksLoading,
    tasksError: tasksContext.tasksError,
    
    // Enhanced methods that update stats
    createTask,
    toggleTaskCompletion,
    
    // Original methods that don't need stat updates
    updateTask: tasksContext.updateTask,
    deleteTask: tasksContext.deleteTask,
    clearAllTasks: tasksContext.clearAllTasks,
    refreshTasks: tasksContext.refreshTasks,
    clearError: tasksContext.clearError,
  };
};
