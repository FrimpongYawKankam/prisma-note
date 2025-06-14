import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

interface Note {
  text: string;
  createdAt: string;
}

export default function Search(): JSX.Element {
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [userData, setUserData] = useState({ username: '' });
  const router = useRouter();

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
    note?.text?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Search Notes</Text>
      <TextInput
        placeholder="Search..."
        placeholderTextColor="#aaa"
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filteredNotes}
        keyExtractor={(item, index) => item.createdAt + index}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>{item.text}</Text>
          </View>
        )}
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
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#64ffda',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  noteItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  noteText: {
    color: '#fff',
    fontSize: 16,
  },
});
