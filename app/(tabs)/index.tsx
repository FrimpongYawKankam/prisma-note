import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Keyboard,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';
import { Menu, Provider } from 'react-native-paper';
import { ModernCard } from '../../src/components/ui/ModernCard';
import { ModernInput } from '../../src/components/ui/ModernInput';
import { useAuth } from '../../src/context/AuthContext';
import { useNotes } from '../../src/context/NotesContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../src/styles/tokens';
import { Note } from '../../src/types/api';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { notes, loading, createNote, deleteNote, refreshNotes } = useNotes();

  const [noteInput, setNoteInput] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Reload notes when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refreshNotes();
      }
    }, [isAuthenticated, refreshNotes])
  );

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setRefreshing(true);
    try {
      await refreshNotes();
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated, refreshNotes]);

  const handleAddNote = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (noteInput.trim() === '') return;
    
    try {
      await createNote({
        title: noteInput.trim(),
        content: '# New Note\nStart writing...'
      });
      setNoteInput('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    router.push({ pathname: '/note-detail', params: { id: note.id } });
  };

  return (
    <Provider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header Section */}
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.headerText, { color: colors.text }]}>
                  📝 <Text style={{ color: colors.primary }}>PrismaNote</Text>
                </Text>
                <Text style={[styles.subText, { color: colors.textSecondary }]}>
                  Welcome back, {user?.fullName || 'User'}!
                </Text>
              </View>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                  </TouchableOpacity>
                }
                contentStyle={{ backgroundColor: colors.surface }}
              >
                <Menu.Item 
                  onPress={() => { setMenuVisible(false); router.push('/profile'); }} 
                  title="Profile" 
                  titleStyle={{ color: colors.text }}
                />
                {/* Help option removed as requested */}
                <Menu.Item 
                  onPress={() => { setMenuVisible(false); router.push('/settings'); }} 
                  title="Settings" 
                  titleStyle={{ color: colors.text }}
                />
                <Menu.Item 
                  onPress={() => { setMenuVisible(false); router.push('/about'); }} 
                  title="About" 
                  titleStyle={{ color: colors.text }}
                />
              </Menu>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <ModernInput
                placeholder="Write a note..."
                value={noteInput}
                onChangeText={setNoteInput}
                rightIcon={
                  <TouchableOpacity
                    onPress={handleAddNote}
                    disabled={noteInput.trim() === ''}
                    style={[
                      {
                        backgroundColor: colors.primary,
                        borderRadius: BorderRadius.md,
                        padding: Spacing.sm,
                        minWidth: 36,
                        minHeight: 36,
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                      noteInput.trim() === '' && { 
                        backgroundColor: colors.textMuted,
                        opacity: 0.5 
                      }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="add" 
                      size={20} 
                      color="#ffffff" 
                    />
                  </TouchableOpacity>
                }
                style={{ marginBottom: 0 }}
              />
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Notes List */}
            {notes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                  No notes yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  Start by creating your first note above
                </Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.notesList}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                  />
                }
              >
                {notes.map((note) => (
                  <ModernCard
                    key={note.id}
                    onPress={() => handleEditNote(note)}
                    style={styles.noteCard}
                  >
                    <Text style={[styles.noteTitle, { color: colors.primary }]}>
                      {note.title}
                    </Text>
                    <Text style={[styles.noteTimestamp, { color: colors.textMuted }]}>
                      {new Date(note.timeCreated).toLocaleDateString()}
                    </Text>
                    <View style={styles.notePreview}>
                      <Markdown 
                        style={{ 
                          body: { 
                            color: colors.textSecondary, 
                            fontSize: Typography.fontSize.sm,
                            lineHeight: Typography.lineHeight.sm,
                          } 
                        }}
                      >
                        {note.content && note.content !== '# New Note\nStart writing...'
                          ? note.content.slice(0, 100) + '...'
                          : '_No content yet_'}
                      </Markdown>
                    </View>
                  </ModernCard>
                ))}
              </ScrollView>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: Spacing.lg,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerText: { 
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700' as const,
    lineHeight: Typography.lineHeight['3xl'],
  },
  subText: { 
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    marginTop: Spacing.xs,
  },
  menuButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['4xl'],
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600' as const,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center' as const,
    paddingHorizontal: Spacing.xl,
  },
  notesList: {
    flex: 1,
  },
  noteCard: {
    marginBottom: Spacing.base,
  },
  noteTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600' as const,
    lineHeight: Typography.lineHeight.lg,
    marginBottom: Spacing.xs,
  },
  noteTimestamp: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  notePreview: {
    marginTop: Spacing.xs,
  },
  // Legacy styles (to be removed)
  inputContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: { flex: 1, height: 40, fontSize: 16, paddingVertical: 5 },
  addButton: { padding: 8, borderRadius: 6 },
  noteItem: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  noteText: { fontSize: 16, marginBottom: 4 },
  noteTimestampLegacy: { fontSize: 12, marginBottom: 4 },
});