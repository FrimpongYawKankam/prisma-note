import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useNotes } from '../../src/context/NotesContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing, Typography } from '../../src/styles/tokens';

export default function Search(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const { notes, searchNotes, searchResults, isSearching, clearSearch } = useNotes();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Clear search when component unmounts
    return () => {
      clearSearch();
    };
  }, [clearSearch]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!isAuthenticated) {
      return;
    }
    
    if (searchQuery.trim() === '') {
      clearSearch();
      return;
    }
    
    try {
      await searchNotes(searchQuery.trim());
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Use search results if searching, otherwise show all notes filtered locally for immediate feedback
  const displayNotes = query.trim() === '' 
    ? notes 
    : searchResults.length > 0 
      ? searchResults 
      : notes.filter((note) =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          (note.content?.toLowerCase().includes(query.toLowerCase()) ?? false)
        );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authPrompt}>
          <Text style={[styles.authPromptText, { color: colors.textMuted }]}>
            Please log in to search your notes
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        onChangeText={handleSearch}
        onSubmitEditing={Keyboard.dismiss}
      />

      {displayNotes.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {query.trim() === '' ? 'Start typing to search your notes...' : 'No matching notes found.'}
        </Text>
      ) : (
        <FlatList
          data={displayNotes}
          keyExtractor={(item) => item.id.toString()}
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
                {new Date(item.timeCreated).toLocaleDateString()}
              </Text>
              <Text style={[styles.noteSnippet, { color: colors.textSecondary }]}>
                {(item.content || '').slice(0, 60)}
                {(item.content || '').length > 60 ? '...' : ''}
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
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  authPromptText: {
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  loginButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});
