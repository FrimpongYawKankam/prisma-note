import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard
} from 'react-native';
import { useTheme } from '@/context/ThemeContext'; // 👈 Use custom theme

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
}

export default function Search(): JSX.Element {
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [userData, setUserData] = useState({ username: '' });
  const router = useRouter();
  const { theme } = useTheme(); // 👈 Access theme context
  const isDark = theme === 'dark';

  useEffect(() => {
    const loadNotes = async () => {
      const user = await AsyncStorage.getItem('user');
      const savedNotes = await AsyncStorage.getItem('notes');
      if (user) setUserData(JSON.parse(user));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
    };
    loadNotes();
  }, []);

  const filteredNotes = notes.filter((note) =>
    (note?.title?.toLowerCase()?.includes(query.toLowerCase()) ||
      note?.content?.toLowerCase()?.includes(query.toLowerCase()))
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Text style={[styles.header, { color: isDark ? '#64ffda' : '#222' }]}>
        Search Notes
      </Text>

      <TextInput
        placeholder="Type to search..."
        placeholderTextColor={isDark ? '#666' : '#888'}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#333' : '#ccc',
          },
        ]}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={Keyboard.dismiss}
      />

      {filteredNotes.length === 0 ? (
        <Text style={[styles.emptyText, { color: isDark ? '#777' : '#888' }]}>
          No matching notes found.
        </Text>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.noteItem,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  borderColor: isDark ? '#333' : '#ccc',
                },
              ]}
              onPress={() => router.push({ pathname: '/note-detail', params: { id: item.id } })}
            >
              <Text style={[styles.noteTitle, { color: isDark ? '#00ffcc' : '#333' }]}>
                {item.title}
              </Text>
              <Text style={[styles.noteDate, { color: isDark ? '#aaa' : '#666' }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={[styles.noteSnippet, { color: isDark ? '#ccc' : '#444' }]}>
                {item.content.slice(0, 60)}
                {item.content.length > 60 ? '...' : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  noteItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteDate: {
    fontSize: 12,
    marginTop: 4,
  },
  noteSnippet: {
    fontSize: 14,
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});
