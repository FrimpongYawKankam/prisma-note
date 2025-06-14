import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadNote = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem('notes');
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          const selectedNote = notes.find((n) => n.id === id);
          if (selectedNote) {
            setNote(selectedNote);
            setTitle(selectedNote.title);
            setContent(selectedNote.content || '');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load note');
      }
    };
    loadNote();
  }, [id]);

  const saveNote = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const updatedNotes = notes.map((n) =>
          n.id === id ? { ...n, title, content } : n
        );
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleBack = async () => {
    await saveNote();
    router.back();
  };

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Loading note...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#64ffda" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        placeholderTextColor="#aaa"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.contentInput}
        placeholder="Start writing here..."
        placeholderTextColor="#888"
        value={content}
        onChangeText={setContent}
        multiline
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#64ffda',
    fontSize: 16,
    marginLeft: 5,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 12,
    paddingVertical: 8,
  },
  contentInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  message: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 50,
  },
});
