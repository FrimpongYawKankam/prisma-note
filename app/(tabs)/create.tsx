import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { MessageBox } from '../../src/components/ui/MessageBox';
import { ModernDialog } from '../../src/components/ui/ModernDialog';
import { useAuth } from '../../src/context/AuthContext';
import { useNotes } from '../../src/context/NotesContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function CreateScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { createNote, loading, error } = useNotes();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveNote = async () => {
    if (!isAuthenticated) {
      setMessage('You must be logged in to create notes.');
      setMessageType('error');
      return;
    }

    if (!title.trim()) {
      setMessage('Please enter a title.');
      setMessageType('error');
      return;
    }

    try {
      setSaving(true);
      await createNote({
        title: title.trim(),
        content: content.trim() || undefined
      });

      setTitle('');
      setContent('');
      Keyboard.dismiss();
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error saving note:', error);
      setMessage(error.message || 'Failed to save the note. Please try again.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.header, { color: colors.text }]}>New Note</Text>
            <TouchableOpacity 
              onPress={saveNote} 
              disabled={saving || loading}
              style={{ opacity: (saving || loading) ? 0.6 : 1 }}
            >
              <Ionicons name="checkmark-done-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.titleInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[
              styles.contentInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Start typing your note here..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
          />

          <MessageBox
            message={message}
            type={messageType}
            duration={3000}
          />

          <ModernDialog
            visible={showSuccessDialog}
            title="Success ✅"
            message="Note saved successfully!"
            buttons={[
              {
                text: 'OK',
                style: 'default',
                onPress: () => {
                  setShowSuccessDialog(false);
                  router.push('/');
                },
              },
            ]}
            onClose={() => setShowSuccessDialog(false)}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
});
