import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      setTitle('');
      setContent('');
      Keyboard.dismiss();
      Alert.alert('Success', 'Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Create</Text>
          <TouchableOpacity onPress={saveNote}>
            <Ionicons name="checkmark-done-outline" size={28} color="#64ffda" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Untitled"
          placeholderTextColor="#555"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Start writing..."
          placeholderTextColor="#666"
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
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    backgroundColor: '#121212',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#eee',
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 12,
    textAlignVertical: 'top',
  },
});
