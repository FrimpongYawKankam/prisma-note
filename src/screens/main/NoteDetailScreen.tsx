import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import { Note } from '../../types/api';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { getNoteById, updateNote, createNote, moveToTrash, notesLoading, notesError } = useNotes();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Animation refs for inputs
  const titleAnimation = useRef(new Animated.Value(0)).current;
  const contentAnimation = useRef(new Animated.Value(0)).current;

  // Animation functions
  const animateInput = (animation: Animated.Value, toValue: number) => {
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputFocus = (animation: Animated.Value) => {
    animateInput(animation, 1);
  };

  const handleInputBlur = (animation: Animated.Value) => {
    animateInput(animation, 0);
  };

  useEffect(() => {
    const loadNote = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!id) {
        // New note - start with empty fields
        setNote(null);
        setTitle('');
        setContent('');
        setHasUnsavedChanges(false);
        return;
      }

      try {
        const noteId = parseInt(id as string);
        if (isNaN(noteId)) {
          setMessage('Invalid note ID');
          setMessageType('error');
          return;
        }

        const loadedNote = await getNoteById(noteId);
        setNote(loadedNote);
        setTitle(loadedNote.title);
        setContent(loadedNote.content || '');
        setHasUnsavedChanges(false);
      } catch (error: any) {
        setMessage(error.message || 'Failed to load note.');
        setMessageType('error');
      }
    };
    
    loadNote();
  }, [id, isAuthenticated, getNoteById, router]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      setMessage('Please log in to save notes');
      setMessageType('error');
      return;
    }

    if (!title.trim()) {
      setMessage('Please enter a title');
      setMessageType('error');
      return;
    }

    try {
      setSaving(true);
      
      if (note) {
        // Update existing note
        const updatedNote = await updateNote(note.id, {
          title: title.trim(),
          content: content.trim()
        });
        setNote(updatedNote);
        setMessage('Note saved successfully');
        setMessageType('success');
      } else {
        // Create new note
        const newNote = await createNote({
          title: title.trim(),
          content: content.trim()
        });
        setNote(newNote);
        setMessage('Note created successfully');
        setMessageType('success');
        // Update the URL to reflect the new note ID
        router.replace(`/note-detail?id=${newNote.id}`);
      }
      
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error('Save failed:', error);
      setMessage(error.message || 'Failed to save note');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (note && (text !== note.title)) {
      setHasUnsavedChanges(true);
    } else if (!note && text.trim()) {
      setHasUnsavedChanges(true);
    }
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    if (note && (text !== (note.content || ''))) {
      setHasUnsavedChanges(true);
    } else if (!note && text.trim()) {
      setHasUnsavedChanges(true);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDelete = () => {
    if (!note) {
      router.back();
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!note) return;
    
    try {
      await moveToTrash(note.id);
      setShowDeleteDialog(false);
      router.back();
    } catch (err: any) {
      setMessage(err.message || 'Failed to delete note.');
      setMessageType('error');
    }
  };

  // Show loading if note is being loaded
  if (notesLoading && id) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
        <Text style={[styles.message, { color: isDark ? '#aaa' : '#666' }]}>Loading note...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>  
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status and Actions */}
        <View style={styles.section}>
          <View style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.statusContent}>
              {saving && (
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  Saving...
                </Text>
              )}
              {hasUnsavedChanges && !saving && (
                <Text style={[styles.statusText, { color: isDark ? '#ff9800' : '#f57c00' }]}>
                  Unsaved changes
                </Text>
              )}
              {!hasUnsavedChanges && !saving && (
                <Text style={[styles.statusText, { color: isDark ? '#4caf50' : '#2e7d32' }]}>
                  {note ? 'Saved' : 'Ready'}
                </Text>
              )}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={handleSave} 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                disabled={saving}
              >
                <Ionicons name="save-outline" size={18} color="#fff" />
              </TouchableOpacity>

              {note && (
                <TouchableOpacity 
                  onPress={handleDelete} 
                  style={[styles.actionButton, { backgroundColor: '#e53935' }]}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Title Input */}
        <Animated.View style={[
          styles.inputContainer, 
          { 
            backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: titleAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.025, 0.15],
            }),
            shadowRadius: titleAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [3, 8],
            }),
            elevation: titleAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 8],
            }),
          }
        ]}>
          <View style={styles.inputHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="text-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.inputHeaderText}>
              <Text style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>
                Title
              </Text>
            </View>
          </View>
          
          <Animated.View style={[
            styles.inputWrapper,
            {
              borderColor: titleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [isDark ? '#333' : '#ddd', colors.primary],
              }),
              borderWidth: titleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2],
              }),
            }
          ]}>
            <TextInput
              style={[styles.titleInput, {
                color: isDark ? '#fff' : '#000',
                backgroundColor: isDark ? '#0d0d0d' : '#fff',
              }]}
              placeholder="Enter note title..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={title}
              onChangeText={handleTitleChange}
              onFocus={() => handleInputFocus(titleAnimation)}
              onBlur={() => handleInputBlur(titleAnimation)}
            />
          </Animated.View>
        </Animated.View>

        {/* Content Input */}
        <Animated.View style={[
          styles.inputContainer, 
          { 
            backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', 
            flex: 1,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: contentAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.025, 0.15],
            }),
            shadowRadius: contentAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [3, 8],
            }),
            elevation: contentAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 8],
            }),
          }
        ]}>
          <View style={styles.inputHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="document-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.inputHeaderText}>
              <Text style={[styles.inputLabel, { color: isDark ? '#fff' : '#000' }]}>
                Content
              </Text>
              <Text style={[styles.inputSubLabel, { color: isDark ? '#aaa' : '#666' }]}>
                Supports Markdown formatting
              </Text>
            </View>
          </View>
          
          <Animated.View style={[
            styles.inputWrapper,
            {
              borderColor: contentAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [isDark ? '#333' : '#ddd', colors.primary],
              }),
              borderWidth: contentAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2],
              }),
            }
          ]}>
            <TextInput
              style={[styles.contentInput, {
                color: isDark ? '#fff' : '#000',
                backgroundColor: isDark ? '#0d0d0d' : '#fff',
              }]}
              placeholder="Start writing your note here.."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={content}
              onChangeText={handleContentChange}
              multiline
              textAlignVertical="top"
              onFocus={() => handleInputFocus(contentAnimation)}
              onBlur={() => handleInputBlur(contentAnimation)}
            />
          </Animated.View>
        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>

      <MessageBox
        message={message}
        type={messageType}
        duration={3000}
      />

      <ModernDialog
        visible={showDeleteDialog}
        title="Delete Note?"
        message="This will permanently delete the note."
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowDeleteDialog(false),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: confirmDelete,
          },
        ]}
        onClose={() => setShowDeleteDialog(false)}
      />
    </SafeAreaView>
  );
}

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
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  inputWrapper: {
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  titleInput: {
    padding: 12,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  contentInput: {
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 200,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  message: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
