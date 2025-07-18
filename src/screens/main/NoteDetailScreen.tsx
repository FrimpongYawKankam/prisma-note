import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import {
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
  const { getNoteById, updateNote, deleteNote, loading, error } = useNotes();
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
      } catch (error: any) {
        setMessage(error.message || 'Failed to load note.');
        setMessageType('error');
      }
    };
    
    loadNote();
  }, [id, isAuthenticated, getNoteById, router]);

  const debouncedSave = useCallback(
    debounce(async (newTitle: string, newContent: string) => {
      if (!note || !isAuthenticated) return;
      
      try {
        setSaving(true);
        const updatedNote = await updateNote(note.id, {
          title: newTitle,
          content: newContent
        });
        setNote(updatedNote);
      } catch (error: any) {
        console.error('Auto-save failed:', error);
        setMessage('Auto-save failed');
        setMessageType('error');
      } finally {
        setSaving(false);
      }
    }, 1000),
    [note, updateNote, isAuthenticated]
  );

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (note) {
      debouncedSave(text, content);
    }
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    if (note) {
      debouncedSave(title, text);
    }
  };

  const handleBack = () => {
    debouncedSave.cancel();
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
      await deleteNote(note.id);
      setShowDeleteDialog(false);
      router.back();
    } catch (err: any) {
      setMessage(err.message || 'Failed to delete note.');
      setMessageType('error');
    }
  };

  // Show loading if note is being loaded
  if (loading && id) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={[styles.message, { color: isDark ? '#aaa' : '#444' }]}>Loading note...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#64ffda' : '#00796b'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setPreviewMode(!previewMode)} style={styles.iconButton}>
          <Ionicons
            name={previewMode ? 'create-outline' : 'eye-outline'}
            size={24}
            color={isDark ? '#64ffda' : '#00796b'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={24} color="#ff5252" />
        </TouchableOpacity>
      </View>

      {previewMode ? (
        <ScrollView style={{ flex: 1 }}>
          <Text style={[styles.previewTitle, { color: isDark ? '#fff' : '#000' }]}>{title}</Text>
          <Markdown style={getMarkdownStyles(isDark)}>
            {content.trim() !== '' ? content : '_Nothing here yet..._'}
          </Markdown>
        </ScrollView>
      ) : (
        <>
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
          />
        </>
      )}

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
  header: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
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
