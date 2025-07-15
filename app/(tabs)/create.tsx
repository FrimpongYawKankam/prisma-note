import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { v4 as uuidv4 } from 'uuid';
import { MessageBox } from '../../src/components/ui/MessageBox';
import { ModernDialog } from '../../src/components/ui/ModernDialog';
import { useTheme } from '../../src/context/ThemeContext'; // ✅ using custom theme

export default function CreateScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage('Please enter both a title and content.');
      setMessageType('error');
      return;
    }

    const newNote = {
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = [...notes, newNote];
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));

      setTitle('');
      setContent('');
      Keyboard.dismiss();

      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error saving note:', error);
      setMessage('Failed to save the note. Please try again.');
      setMessageType('error');
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
            <TouchableOpacity onPress={saveNote}>
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
