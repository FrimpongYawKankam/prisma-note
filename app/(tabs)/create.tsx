import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export default function CreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Info', 'Please enter both a title and content.');
      return;
    }

    const newNote = {
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = [...notes, newNote];
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));

      // Clear input
      setTitle('');
      setContent('');
      Keyboard.dismiss();

      // Feedback
      Alert.alert('Success ✅', 'Note saved successfully!', [
        { text: 'OK', onPress: () => router.push('/') },
      ]);
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error ❌', 'Failed to save the note. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>New Note</Text>
          <TouchableOpacity onPress={saveNote}>
            <Ionicons name="checkmark-done-outline" size={28} color="#64ffda" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Start typing your note here..."
          placeholderTextColor="#888"
          value={content}
          onChangeText={setContent}
          multiline
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  titleInput: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#eee',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    textAlignVertical: 'top',
  },
});
