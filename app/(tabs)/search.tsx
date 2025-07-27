import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { useAuth } from '../../src/context/AuthContext';
import { useNotes } from '../../src/context/NotesContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { Note } from '../../src/types/api';

interface NoteSection {
  title: string;
  data: Note[];
}

export default function NotesScreen(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const { notes, refreshNotes } = useNotes();

  // Reload notes when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refreshNotes();
      }
    }, [isAuthenticated])
  );

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setRefreshing(true);
    try {
      await refreshNotes();
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (query.trim() === '') {
      return notes;
    }
    
    return notes.filter((note) =>
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      (note.content?.toLowerCase().includes(query.toLowerCase()) ?? false)
    );
  }, [notes, query]);

  // Group notes by date
  const groupedNotes = useMemo(() => {
    const groups: { [key: string]: Note[] } = {};
    
    filteredNotes.forEach((note) => {
      const date = new Date(note.timeCreated);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      
      // Check if it's today
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      }
      // Check if it's yesterday
      else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      }
      // Check if it's this week
      else if (date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week';
      }
      // Check if it's this month
      else if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        groupKey = 'This Month';
      }
      // Otherwise, group by month/year
      else {
        groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(note);
    });

    // Sort notes within each group by creation date (newest first)
    Object.values(groups).forEach(group => {
      group.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());
    });

    // Convert to section list format and sort sections
    const sections: NoteSection[] = Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }));

    // Custom sort for sections
    const sectionOrder = ['Today', 'Yesterday', 'This Week', 'This Month'];
    sections.sort((a, b) => {
      const aIndex = sectionOrder.indexOf(a.title);
      const bIndex = sectionOrder.indexOf(b.title);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        // For month/year sections, sort by most recent first
        return b.title.localeCompare(a.title);
      }
    });

    return sections;
  }, [filteredNotes]);

  const handleNotePress = (note: Note) => {
    router.push({ pathname: '/note-detail', params: { id: note.id } });
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <ModernCard
      style={styles.noteCard}
      onPress={() => handleNotePress(item)}
    >
      <Text style={[styles.noteTitle, { color: colors.primary }]}>
        {item.title}
      </Text>
      <Text style={[styles.noteDate, { color: colors.textMuted }]}>
        {new Date(item.timeCreated).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
      {item.content && item.content !== '# New Note\nStart writing...' && (
        <Text style={[styles.notePreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.content.replace(/^#+\s+/, '').slice(0, 100)}
          {item.content.length > 100 ? '...' : ''}
        </Text>
      )}
    </ModernCard>
  );

  const renderSectionHeader = ({ section }: { section: NoteSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {section.title}
      </Text>
      <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
        {section.data.length} {section.data.length === 1 ? 'note' : 'notes'}
      </Text>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authPrompt}>
          <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.authPromptText, { color: colors.textMuted }]}>
            Please log in to view your notes
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
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Ionicons name="document-text" size={28} color={colors.primary} style={styles.headerIcon} />
          <Text style={[styles.header, { color: colors.primary }]}>
            My Notes
          </Text>
        </View>
        <Text style={[styles.subHeader, { color: colors.textSecondary }]}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} organized by date
        </Text>
      </View>

      {/* Search Input */}
      <View style={[styles.searchInputContainer, { 
        backgroundColor: colors.surface, 
        borderColor: colors.border 
      }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
        <TextInput
          placeholder="Search your notes..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Notes List */}
      {groupedNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            {query.trim() === '' ? 'No notes yet' : 'No matching notes found'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {query.trim() === '' 
              ? 'Create your first note from the home screen' 
              : 'Try a different search term'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedNotes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNoteItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingBottom: Spacing.base }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.sm,
  },
  headerSection: {
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  headerIcon: {
    marginRight: Spacing.sm,
  },
  header: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold as any,
  },
  subHeader: {
    fontSize: Typography.fontSize.base,
    fontWeight: '400',
    marginLeft: 40, // Align with the text (icon width + margin)
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.sm,
  },
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  noteCard: {
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.base,
    padding: Spacing.base,
  },
  noteTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  noteDate: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  notePreview: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['4xl'],
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  loginButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});
