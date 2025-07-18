import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing, Typography } from '../../src/styles/tokens';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
}

export default function Search(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [userData, setUserData] = useState({ fullName: '' });
  const router = useRouter();
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const loadNotes = async () => {
      const user = await AsyncStorage.getItem('user');
      const savedNotes = await AsyncStorage.getItem('notes');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData({ fullName: parsedUser.fullName || parsedUser.email?.split('@')[0] || '' });
      }
      if (savedNotes) setNotes(JSON.parse(savedNotes));
    };
    loadNotes();
  }, []);

  const filteredNotes = notes.filter((note) =>
    (note?.title?.toLowerCase()?.includes(query.toLowerCase()) ||
      note?.content?.toLowerCase()?.includes(query.toLowerCase()))
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>
        Search Notes
      </Text>

      <TextInput
        placeholder="Type to search..."
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={Keyboard.dismiss}
      />

      {filteredNotes.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
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
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push({ pathname: '/note-detail', params: { id: item.id } })}
            >
              <Text style={[styles.noteTitle, { color: colors.primary }]}>
                {item.title}
              </Text>
              <Text style={[styles.noteDate, { color: colors.textMuted }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={[styles.noteSnippet, { color: colors.textSecondary }]}>
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
    padding: Spacing.base,
  },
  header: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold as any,
    marginBottom: Spacing.base,
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
