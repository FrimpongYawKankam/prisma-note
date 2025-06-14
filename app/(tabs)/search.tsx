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
  useColorScheme
} from 'react-native';

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
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

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
      <Text style={[styles.header, { color: isDark ? '#64ffda' : '#333' }]}>Search Notes</Text>

      <TextInput
        placeholder="Type to search..."
        placeholderTextColor={isDark ? '#666' : '#aaa'}
        style={[styles.input, { backgroundColor: isDark ? '#1a1a1a' : '#eee', color: isDark ? '#fff' : '#000' }]}
        value={query}
        onChangeText={setQuery}
      />

      {filteredNotes.length === 0 ? (
        <Text style={[styles.emptyText, { color: isDark ? '#888' : '#666' }]}>No matching notes found.</Text>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.noteItem, { backgroundColor: isDark ? '#1a1a1a' : '#f8f8f8' }]}
              onPress={() => router.push({ pathname: '/note-detail', params: { id: item.id } })}
            >
              <Text style={[styles.noteTitle, { color: isDark ? '#00ffcc' : '#333' }]}>{item.title}</Text>
              <Text style={[styles.noteDate, { color: isDark ? '#aaa' : '#999' }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={[styles.noteSnippet, { color: isDark ? '#ccc' : '#444' }]}>
                {item.content.slice(0, 60)}{item.content.length > 60 ? '...' : ''}
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
    marginBottom: 12,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  noteItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
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
