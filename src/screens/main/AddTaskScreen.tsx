import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { useTasks } from '../../context/TasksContext';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadows, Spacing, Typography } from '../../styles/tokens';

const AddTaskScreen = () => {
  const { colors } = useTheme();
  const { editTaskId, editTaskText } = useLocalSearchParams<{
    editTaskId?: string; // Still string from URL params, will convert to number
    editTaskText?: string;
  }>();
  
  const [taskText, setTaskText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const { createTask, updateTask } = useTasks();
  
  const isEditing = !!editTaskId;

  useEffect(() => {
    if (isEditing && editTaskText) {
      setTaskText(editTaskText);
    }
  }, [isEditing, editTaskText]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, messageType === 'success' ? 2000 : 4000);
      
      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

  const handleSave = async () => {
    if (!taskText.trim()) {
      setMessage('Please enter a task description');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      if (isEditing && editTaskId) {
        const taskId = parseInt(editTaskId, 10);
        await updateTask(taskId, { text: taskText.trim() });
        setMessage('Task updated successfully!');
        setMessageType('success');
      } else {
        await createTask({ text: taskText.trim() });
        setMessage('Task created successfully!');
        setMessageType('success');
      }
      
      // Wait a moment to show success message, then navigate back
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      setMessage(error.message || `Failed to ${isEditing ? 'update' : 'create'} task`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const originalText = isEditing ? editTaskText || '' : '';
    const hasChanges = taskText.trim() !== originalText.trim();
    
    if (hasChanges) {
      Alert.alert(
        `Discard ${isEditing ? 'Changes' : 'Task'}?`,
        `Are you sure you want to discard ${isEditing ? 'your changes' : 'this task'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Modern Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surface }]} 
            onPress={handleCancel}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isEditing ? 'Edit Task' : 'New Task'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {isEditing ? 'Update your daily task' : 'Create a new daily task'}
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Message Box */}
          {message ? (
            <MessageBox
              message={message}
              type={messageType}
              style={styles.messageBox}
              duration={messageType === 'success' ? 2000 : 4000}
            />
          ) : null}

          {/* Task Input Card */}
          <ModernCard style={styles.inputCard} variant="elevated" padding="lg">
            <View style={styles.inputHeader}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
              <View style={styles.inputHeaderText}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Task Description
                </Text>
                <Text style={[styles.inputSubLabel, { color: colors.textSecondary }]}>
                  What do you need to accomplish today?
                </Text>
              </View>
            </View>
            
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border, 
                color: colors.text 
              }]}
              value={taskText}
              onChangeText={setTaskText}
              placeholder="Enter your task description..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
            
            <View style={styles.inputFooter}>
              <View style={styles.characterCount}>
                <Text style={[styles.characterCountText, { color: colors.textMuted }]}>
                  {taskText.length} characters
                </Text>
              </View>
            </View>
          </ModernCard>

          {/* Tips Card */}
          <ModernCard style={styles.tipsCard} variant="outlined" padding="md">
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={20} color={colors.accent} />
              <Text style={[styles.tipsTitle, { color: colors.text }]}>
                Tips for better tasks
              </Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
                • Be specific and actionable
              </Text>
              <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
                • Include time estimates if helpful
              </Text>
              <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
                • Break large tasks into smaller ones
              </Text>
            </View>
          </ModernCard>
        </ScrollView>

        {/* Modern Footer */}
        <View style={[styles.footer, { 
          borderTopColor: colors.border, 
          backgroundColor: colors.background 
        }]}>
          <ModernButton
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="md"
            disabled={loading}
            style={styles.footerButton}
            enableHaptics={true}
          />
          <ModernButton
            title={isEditing ? 'Update Task' : 'Create Task'}
            onPress={handleSave}
            variant="primary"
            size="md"
            loading={loading}
            disabled={loading || !taskText.trim()}
            style={styles.footerButton}
            enableHaptics={true}
            leftIcon={
              !loading ? (
                <Ionicons 
                  name={isEditing ? "checkmark" : "add"} 
                  size={18} 
                  color="#ffffff" 
                />
              ) : undefined
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    minHeight: 70,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    lineHeight: Typography.lineHeight.lg,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '400',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  messageBox: {
    marginBottom: Spacing.base,
  },
  inputCard: {
    marginBottom: Spacing.base,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  inputHeaderText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  inputLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    lineHeight: Typography.lineHeight.lg,
  },
  inputSubLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '400',
    marginTop: 2,
  },
  textInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.base,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: Spacing.sm,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    marginLeft: 'auto',
  },
  characterCountText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '400',
  },
  tipsCard: {
    marginBottom: Spacing.base,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  tipsList: {
    gap: Spacing.xs,
  },
  tipItem: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'], // Extra space for tab bar
    gap: Spacing.sm,
    borderTopWidth: 1,
    ...Shadows.lg,
  },
  footerButton: {
    flex: 1,
  },
});

export default AddTaskScreen;
