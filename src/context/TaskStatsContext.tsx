import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface TaskStats {
  totalTasksEverCreated: number;
  totalTasksEverCompleted: number;
  completionRate: number;
}

interface TaskStatsContextType {
  stats: TaskStats;
  incrementTasksCreated: () => Promise<void>;
  incrementTasksCompleted: () => Promise<void>;
  decrementTasksCompleted: () => Promise<void>;
  refreshStats: () => Promise<void>;
  resetStats: () => Promise<void>;
}

const TASK_STATS_KEY = 'task_stats';

const defaultStats: TaskStats = {
  totalTasksEverCreated: 0,
  totalTasksEverCompleted: 0,
  completionRate: 0,
};

const TaskStatsContext = createContext<TaskStatsContextType | undefined>(undefined);

export const TaskStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<TaskStats>(defaultStats);
  const { isAuthenticated, user } = useAuth();

  // Get user-specific storage key
  const getUserStatsKey = useCallback(() => {
    if (!user?.id) return TASK_STATS_KEY;
    return `${TASK_STATS_KEY}_${user.id}`;
  }, [user?.id]);

  // Load stats from AsyncStorage
  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const key = getUserStatsKey();
      const storedStats = await AsyncStorage.getItem(key);
      
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        // Calculate completion rate
        const completionRate = parsedStats.totalTasksEverCreated > 0 
          ? Math.round((parsedStats.totalTasksEverCompleted / parsedStats.totalTasksEverCreated) * 100)
          : 0;
        
        setStats({
          ...parsedStats,
          completionRate,
        });
      } else {
        // Initialize with default stats
        setStats(defaultStats);
        await AsyncStorage.setItem(key, JSON.stringify(defaultStats));
      }
    } catch (error) {
      console.error('Failed to load task stats:', error);
      setStats(defaultStats);
    }
  }, [isAuthenticated, getUserStatsKey]);

  // Save stats to AsyncStorage
  const saveStats = useCallback(async (newStats: TaskStats) => {
    if (!isAuthenticated) return;
    
    try {
      const key = getUserStatsKey();
      await AsyncStorage.setItem(key, JSON.stringify(newStats));
    } catch (error) {
      console.error('Failed to save task stats:', error);
    }
  }, [isAuthenticated, getUserStatsKey]);

  // Update stats with completion rate calculation
  const updateStats = useCallback((updater: (prevStats: TaskStats) => Partial<TaskStats>) => {
    setStats(prevStats => {
      const updated = { ...prevStats, ...updater(prevStats) };
      // Recalculate completion rate
      updated.completionRate = updated.totalTasksEverCreated > 0 
        ? Math.round((updated.totalTasksEverCompleted / updated.totalTasksEverCreated) * 100)
        : 0;
      
      // Save to AsyncStorage
      saveStats(updated);
      
      return updated;
    });
  }, [saveStats]);

  // Increment total tasks created
  const incrementTasksCreated = useCallback(async () => {
    updateStats(prev => ({
      totalTasksEverCreated: prev.totalTasksEverCreated + 1,
    }));
  }, [updateStats]);

  // Increment total tasks completed
  const incrementTasksCompleted = useCallback(async () => {
    updateStats(prev => ({
      totalTasksEverCompleted: prev.totalTasksEverCompleted + 1,
    }));
  }, [updateStats]);

  // Decrement total tasks completed (when unchecking a task)
  const decrementTasksCompleted = useCallback(async () => {
    updateStats(prev => ({
      totalTasksEverCompleted: Math.max(0, prev.totalTasksEverCompleted - 1),
    }));
  }, [updateStats]);

  // Refresh stats from storage
  const refreshStats = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  // Reset stats (useful for testing or user preference)
  const resetStats = useCallback(async () => {
    const resetStats = { ...defaultStats };
    setStats(resetStats);
    await saveStats(resetStats);
  }, [saveStats]);

  // Load stats when user authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    } else {
      setStats(defaultStats);
    }
  }, [isAuthenticated, loadStats]);

  const value: TaskStatsContextType = {
    stats,
    incrementTasksCreated,
    incrementTasksCompleted,
    decrementTasksCompleted,
    refreshStats,
    resetStats,
  };

  return (
    <TaskStatsContext.Provider value={value}>
      {children}
    </TaskStatsContext.Provider>
  );
};

export const useTaskStats = (): TaskStatsContextType => {
  const context = useContext(TaskStatsContext);
  if (context === undefined) {
    throw new Error('useTaskStats must be used within a TaskStatsProvider');
  }
  return context;
};
