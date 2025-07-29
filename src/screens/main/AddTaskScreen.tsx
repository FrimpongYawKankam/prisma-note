import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useTheme } from '../../context/ThemeContext';
import { useTaskManagement } from '../../context/useTaskManagement';

const AddTaskScreen = () => {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  const { editTaskId, editTaskText } = useLocalSearchParams<{
    editTaskId?: string;
    editTaskText?: string;
  }>();
  
  const [taskText, setTaskText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
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
  const { createTask, updateTask } = useTaskManagement();
  
  const isEditing = !!editTaskId;

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
        await updateTask(parseInt(editTaskId), { text: taskText.trim() });
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
      showDialog(
        `Discard ${isEditing ? 'Changes' : 'Task'}?`,
        `Are you sure you want to discard ${isEditing ? 'your changes' : 'this task'}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: hideDialog },
          { text: 'Discard', style: 'destructive', onPress: () => { hideDialog(); router.back(); } },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={handleCancel}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>
            {isEditing ? 'Edit Task' : 'New Task'}
          </Text>
        </View>
        {/* Message Box */}
        {message ? (
          <MessageBox
            message={message}
            type={messageType}
            style={styles.messageBox}
            duration={messageType === 'success' ? 2000 : 4000}
          />
        ) : null}

        {/* Task Input */}
        <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
          <View style={styles.inputHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.inputHeaderText}>
              <Text style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>
                Task Description
              </Text>
              <Text style={[styles.inputSubLabel, { color: isDark ? '#aaa' : '#666' }]}>
                What do you need to accomplish today?
              </Text>
            </View>
          </View>
          
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: isDark ? '#0d0d0d' : '#fff',
              borderColor: isDark ? '#333' : '#ddd',
              color: isDark ? '#fff' : '#000'
            }]}
            value={taskText}
            onChangeText={setTaskText}
            placeholder="Enter your task description..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            autoFocus
          />
          
          <View style={styles.inputFooter}>
            <Text style={[styles.characterCountText, { color: isDark ? '#666' : '#999' }]}>
              {taskText.length} characters
            </Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <View style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.tipsContent}>
              <Text style={[styles.tipsTitle, { color: isDark ? '#fff' : '#000' }]}>
                Tips for better tasks
              </Text>
              <View style={styles.tipsList}>
                <Text style={[styles.tipItem, { color: isDark ? '#ccc' : '#666' }]}>
                  • Be specific and actionable
                </Text>
                <Text style={[styles.tipItem, { color: isDark ? '#ccc' : '#666' }]}>
                  • Include time estimates if helpful
                </Text>
                <Text style={[styles.tipItem, { color: isDark ? '#ccc' : '#666' }]}>
                  • Break large tasks into smaller ones
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomContainer}>
          <ModernButton
            title="Cancel"
            onPress={handleCancel}
            variant="ghost"
            disabled={loading}
            style={styles.cancelButton}
          />
          <ModernButton
            title={isEditing ? 'Update Task' : 'Create Task'}
            onPress={handleSave}
            variant="primary"
            loading={loading}
            disabled={loading || !taskText.trim()}
            leftIcon={<Ionicons name="checkmark" size={20} color="white" />}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>

      <ModernDialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        buttons={dialog.buttons}
        onClose={hideDialog}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    lineHeight: 30,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '500',
    lineHeight: 20,
  },
  messageBox: {
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputHeaderText: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  inputSubLabel: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  inputFooter: {
    alignItems: 'flex-end',
  },
  characterCountText: {
    fontSize: 12,
    fontWeight: '400',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default AddTaskScreen;
