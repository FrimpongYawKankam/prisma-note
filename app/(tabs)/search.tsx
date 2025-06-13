import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Note = {
  id: string;
  title: string;
};

const dummyNotes: Note[] = [
  { id: '1', title: 'Weekly Reflection' },
  { id: '2', title: 'React Native Guide' },
  { id: '3', title: 'Database Project Ideas' },
  { id: '4', title: 'UI/UX Feedback' },
  { id: '5', title: 'Exam Prep Checklist' },
];

export default function Search(): JSX.Element {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const filteredNotes = dummyNotes.filter(note =>
    note.title.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem: ListRenderItem<Note> = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => router.push({ pathname: '/note-details', params: { title: item.title } })}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Notes</Text>
      <TextInput
        style={styles.input}
        placeholder="Type to search..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.noResult}>No matching notes found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  noteCard: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  noteTitle: {
    color: '#fff',
    fontSize: 16,
  },
  noResult: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
