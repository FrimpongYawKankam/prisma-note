import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Menu, Provider } from 'react-native-paper';
import { MockDebugPanel } from '../../src/components/ui/MockDebugPanel';
import { ModernButton } from '../../src/components/ui/ModernButton';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { ModernDialog } from '../../src/components/ui/ModernDialog';
import { useAuth } from '../../src/context/AuthContext';
import { useEvents } from '../../src/context/EventsContext';
import { useNotes } from '../../src/context/NotesContext';
import { useTasks } from '../../src/context/TasksContext';
import { useTheme } from '../../src/context/ThemeContext';
import productivityQuotes from '../../src/screens/others/productivityQuotes.json';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { DailyTask } from '../../src/types/task';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { events, eventsLoading, refreshEvents } = useEvents();
  const { createNote } = useNotes();
  const { todayTasks, tasksLoading, updateTask, toggleTaskCompletion, deleteTask, clearAllTasks, refreshTasks } = useTasks();

  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState({ text: '', author: '' });
  const [dialog, setDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refreshEvents();
        refreshTasks();
      }
    }, [isAuthenticated])
  );

  // Get random quote on component mount
  useEffect(() => {
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * productivityQuotes.quotes.length);
      setCurrentQuote(productivityQuotes.quotes[randomIndex]);
    };
    getRandomQuote();
  }, []);

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setRefreshing(true);
    try {
      await Promise.all([refreshEvents(), refreshTasks()]);
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  const showDialog = (title: string, message: string, buttons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>) => {
    setDialog({
      visible: true,
      title,
      message,
      buttons
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, visible: false }));
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Filter today's events
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startDateTime).toISOString().split('T')[0];
    return eventDate === getTodayDateString();
  });

  const handleTaskToggle = async (task: DailyTask) => {
    try {
      await toggleTaskCompletion(task.id);
    } catch (error: any) {
      showDialog('Error', error.message || 'Failed to update task', [
        { text: 'OK', onPress: hideDialog }
      ]);
    }
  };

  const handleTaskEdit = (task: DailyTask) => {
    router.push({ 
      pathname: '/add-task', 
      params: { editTaskId: task.id, editTaskText: task.text } 
    });
  };

  const handleTaskDelete = async (task: DailyTask) => {
    showDialog(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel', onPress: hideDialog },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            hideDialog();
            try {
              await deleteTask(task.id);
            } catch (error: any) {
              showDialog('Error', error.message || 'Failed to delete task', [
                { text: 'OK', onPress: hideDialog }
              ]);
            }
          }
        },
      ]
    );
  };

  const handleClearAllTasks = () => {
    if (todayTasks.length === 0) return;
    
    showDialog(
      'Clear All Tasks',
      'Are you sure you want to clear all tasks for today?',
      [
        { text: 'Cancel', style: 'cancel', onPress: hideDialog },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: async () => {
            hideDialog();
            try {
              await clearAllTasks();
            } catch (error: any) {
              showDialog('Error', error.message || 'Failed to clear tasks', [
                { text: 'OK', onPress: hideDialog }
              ]);
            }
          }
        },
      ]
    );
  };

  const handleCreateNote = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const note = await createNote({
        title: 'New Note',
        content: '# New Note\nStart writing...'
      });
      router.push({ pathname: '/note-detail', params: { id: note.id } });
    } catch (error: any) {
      showDialog('Error', error.message || 'Failed to create note', [
        { text: 'OK', onPress: hideDialog }
      ]);
    }
  };

  return (
    <Provider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Mock Debug Panel */}
          <MockDebugPanel />
          
          {/* Header Section */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerText, { color: colors.primary }]}>
                Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!
              </Text>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity 
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                >
                  <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: colors.surface }}
            >
              <Menu.Item 
                onPress={() => { setMenuVisible(false); router.push('/settings'); }} 
                title="Settings" 
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item 
                onPress={() => { setMenuVisible(false); router.push('/about'); }} 
                title="About" 
                titleStyle={{ color: colors.text }}
              />
              <Menu.Item
                onPress={() => { setMenuVisible(false); router.push('/trash'); }} 
                title="Trash" 
                titleStyle={{ color: colors.text }}
              />
            </Menu>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {/* Inspirational Quote Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                From {currentQuote.author},
              </Text>
              <ModernCard style={[styles.quoteCard, { borderLeftColor: colors.primary }] as any}>
                <View style={styles.quoteIconContainer}>
                  <Ionicons name="bulb-outline" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.quoteText, { color: colors.text }]}>
                  "{currentQuote.text}"
                </Text>
              </ModernCard>
            </View>

            {/* For Today Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                For Today
              </Text>
              {todayEvents.length === 0 ? (
                <ModernCard style={styles.emptyCard}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Nothing for today!
                  </Text>
                </ModernCard>
              ) : (
                <View>
                  {todayEvents.map((event) => (
                    <ModernCard 
                      key={event.id} 
                      style={styles.eventCard}
                      onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
                    >
                      <View style={styles.eventHeader}>
                        <Text style={[styles.eventTitle, { color: colors.primary }]}>
                          {event.title}
                        </Text>
                        <Text style={[styles.eventTime, { color: colors.textMuted }]}>
                          {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      {event.description && (
                        <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                          {event.description}
                        </Text>
                      )}
                    </ModernCard>
                  ))}
                </View>
              )}
            </View>

            {/* Daily Tasks Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Daily Tasks
                </Text>
                <View style={styles.taskButtons}>
                  <TouchableOpacity
                    style={[styles.taskButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/add-task')}
                  >
                    <Ionicons name="add" size={16} color="#ffffff" />
                  </TouchableOpacity>
                  {todayTasks.length > 0 && (
                    <TouchableOpacity
                      style={[styles.taskButton, { backgroundColor: colors.error }]}
                      onPress={handleClearAllTasks}
                    >
                      <Ionicons name="trash" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {todayTasks.length === 0 ? (
                <ModernCard style={styles.emptyCard}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No tasks set for today
                  </Text>
                  <ModernButton
                    title="Add Task"
                    onPress={() => router.push('/add-task')}
                    style={styles.addTaskButton}
                  />
                </ModernCard>
              ) : (
                <View>
                  {todayTasks.map((task) => (
                    <ModernCard 
                      key={task.id} 
                      style={[
                        styles.taskCard,
                        {
                          borderLeftWidth: 4,
                          borderLeftColor: task.isCompleted ? colors.success : colors.error,
                        }
                      ] as any}
                    >
                      <View style={styles.taskContent}>
                        <TouchableOpacity
                          style={styles.taskCheckbox}
                          onPress={() => handleTaskToggle(task)}
                        >
                          <Ionicons
                            name={task.isCompleted ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={task.isCompleted ? colors.success : colors.error}
                          />
                        </TouchableOpacity>
                        <Text 
                          style={[
                            styles.taskText, 
                            { color: task.isCompleted ? colors.textMuted : colors.text },
                            task.isCompleted && styles.taskTextCompleted
                          ]}
                        >
                          {task.text}
                        </Text>
                        <View style={styles.taskActions}>
                          <TouchableOpacity
                            style={[styles.taskActionButton, { backgroundColor: task.isCompleted ? colors.success : colors.warning }]}
                            onPress={() => handleTaskToggle(task)}
                            accessibilityLabel={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                          >
                            <Ionicons 
                              name={task.isCompleted ? "checkmark" : "ellipse-outline"} 
                              size={14} 
                              color="#ffffff" 
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.taskActionButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleTaskEdit(task)}
                            accessibilityLabel="Edit task"
                          >
                            <Ionicons name="pencil" size={14} color="#ffffff" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.taskActionButton, { backgroundColor: colors.error }]}
                            onPress={() => handleTaskDelete(task)}
                            accessibilityLabel="Delete task"
                          >
                            <Ionicons name="trash" size={14} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ModernCard>
                  ))}
                </View>
              )}
            </View>

            {/* Quick Notes Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Quick Notes
              </Text>
              <ModernCard style={styles.notesCard}>
                <View style={styles.notesContent}>
                  <View style={styles.notesInfo}>
                    <Ionicons name="document-text" size={24} color={colors.primary} />
                    <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                      Capture your thoughts instantly
                    </Text>
                  </View>
                  <View style={styles.notesActions}>
                    <ModernButton
                      title="New Note"
                      onPress={handleCreateNote}
                      style={styles.noteButton}
                    />
                  </View>
                </View>
              </ModernCard>
              <TouchableOpacity 
                style={styles.viewAllNotes}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Text style={[styles.viewAllNotesText, { color: colors.primary }]}>
                  View All Notes
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>

        <ModernDialog
          visible={dialog.visible}
          title={dialog.title}
          message={dialog.message}
          buttons={dialog.buttons}
          onClose={hideDialog}
        />
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: Spacing.lg,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  headerText: { 
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700' as const,
    lineHeight: Typography.lineHeight['2xl'],
  },
  subText: { 
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    marginTop: Spacing.xs,
  },
  menuButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600' as const,
    marginBottom: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  taskButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  taskButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center' as const,
    marginBottom: Spacing.base,
  },
  addTaskButton: {
    marginTop: Spacing.sm,
  },
  eventCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  eventTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600' as const,
    flex: 1,
    marginRight: Spacing.sm,
  },
  eventTime: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500' as const,
  },
  eventDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
  },
  taskCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  taskCheckbox: {
    padding: Spacing.xs,
  },
  taskText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through' as const,
  },
  taskActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  taskActionButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.base,
  },
  notesContent: {
    gap: Spacing.base,
  },
  notesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  notesText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
  notesActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  noteButton: {
    flex: 1,
  },
  viewAllNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  viewAllNotesText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500' as const,
  },
  quoteCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderLeftWidth: 3,
  },
  quoteIconContainer: {
    marginBottom: Spacing.sm,
  },
  quoteText: {
    fontSize: Typography.fontSize.base,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
});