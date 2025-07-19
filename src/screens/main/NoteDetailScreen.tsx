import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
import Markdown from 'react-native-markdown-display';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import { Note } from '../../types/api';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { getNoteById, updateNote, createNote, moveToTrash, notesLoading, notesError } = useNotes();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!id) {
        // New note
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
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={[styles.message, { color: isDark ? '#aaa' : '#444' }]}>Loading note...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#64ffda' : '#00796b'} />
          </TouchableOpacity>

          <View style={styles.headerMiddle}>
            {saving && (
              <Text style={[styles.savingText, { color: isDark ? '#64ffda' : '#00796b' }]}>
                Saving...
              </Text>
            )}
            {hasUnsavedChanges && !saving && (
              <Text style={[styles.unsavedText, { color: isDark ? '#ff9800' : '#f57c00' }]}>
                Unsaved changes
              </Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[
                styles.saveButton, 
                { 
                  backgroundColor: hasUnsavedChanges 
                    ? (isDark ? '#64ffda' : '#00796b')
                    : (isDark ? '#333' : '#ddd'),
                  opacity: saving ? 0.6 : 1
                }
              ]}
              disabled={saving}
            >
              <Ionicons 
                name="save-outline" 
                size={20} 
                color={hasUnsavedChanges 
                  ? (isDark ? '#000' : '#fff')
                  : (isDark ? '#666' : '#999')
                } 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPreviewMode(!previewMode)} style={styles.iconButton}>
              <Ionicons
                name={previewMode ? 'create-outline' : 'eye-outline'}
                size={24}
                color={isDark ? '#64ffda' : '#00796b'}
              />
            </TouchableOpacity>

            {note && (
              <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={24} color="#ff5252" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {previewMode ? (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.previewTitle, { color: isDark ? '#fff' : '#000' }]}>{title}</Text>
            <Markdown style={getMarkdownStyles(isDark)}>
              {content.trim() !== '' ? content : '_Nothing here yet..._'}
            </Markdown>
          </ScrollView>
        ) : (
          <View style={styles.editContent}>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: isDark ? '#fff' : '#000',
                  borderBottomColor: isDark ? '#333' : '#aaa',
                },
              ]}
              placeholder="Title"
              placeholderTextColor={isDark ? '#777' : '#aaa'}
              value={title}
              onChangeText={handleTitleChange}
            />
            <TextInput
              style={[
                styles.contentInput,
                {
                  color: isDark ? '#eee' : '#111',
                },
              ]}
              placeholder={note ? "Start writing here..." : "# New note\nStart writing..."}
              placeholderTextColor={isDark ? '#666' : '#aaa'}
              value={content}
              onChangeText={handleContentChange}
              multiline
              scrollEnabled={true}
            />
          </View>
        )}
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
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMiddle: {
    flex: 1,
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  savingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  unsavedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
    paddingBottom: 80, // Extra padding to prevent content from being hidden behind tab bar
  },
  editContent: {
    flex: 1,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingVertical: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'top',
    paddingBottom: 80, // Extra padding to prevent content from being hidden behind tab bar
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

const getMarkdownStyles = (isDark: boolean) => ({
  body: {
    color: isDark ? '#ccc' : '#333',
    fontSize: 16,
    lineHeight: 24,
    paddingBottom: 40,
  },
  heading1: { color: '#64ffda' },
});
