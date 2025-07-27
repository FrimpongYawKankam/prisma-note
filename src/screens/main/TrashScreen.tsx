import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBox } from '../../components/ui/MessageBox';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernDialog } from '../../components/ui/ModernDialog';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import { Note } from '../../types/api';

export default function TrashScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const {
    trashedNotes,
    trashLoading,
    trashError,
    trashedNotesCount,
    trashSearchResults,
    isSearchingTrash,
    fetchTrashedNotes,
    restoreNote,
    permanentlyDeleteNote,
    emptyTrash,
    searchTrashedNotes,
    clearTrashSearch,
    trashSearchKeyword,
    setTrashSearchKeyword,
  } = useNotes();

  const [localSearchKeyword, setLocalSearchKeyword] = useState(trashSearchKeyword || '');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const isDark = theme === 'dark';
  const displayedNotes = localSearchKeyword.trim() ? trashSearchResults : trashedNotes;

  useEffect(() => {
    fetchTrashedNotes();
  }, []);

  const handleSearch = async (keyword: string) => {
    setLocalSearchKeyword(keyword);
    setTrashSearchKeyword(keyword);
    
    if (keyword.trim()) {
      await searchTrashedNotes(keyword);
    } else {
      clearTrashSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchKeyword('');
    clearTrashSearch();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTrashedNotes();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRestore = async (note: Note) => {
    try {
      await restoreNote(note.id);
      setMessage(`"${note.title}" restored successfully`);
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.message || 'Failed to restore note');
      setMessageType('error');
    }
  };

  const handlePermanentDelete = (note: Note) => {
    setNoteToDelete(note);
    setShowDeleteDialog(true);
  };

  const confirmPermanentDelete = async () => {
    if (!noteToDelete) return;
    
    try {
      await permanentlyDeleteNote(noteToDelete.id);
      setMessage(`"${noteToDelete.title}" permanently deleted`);
      setMessageType('success');
      setShowDeleteDialog(false);
      setNoteToDelete(null);
    } catch (error: any) {
      setMessage(error.message || 'Failed to delete note permanently');
      setMessageType('error');
    }
  };

  const handleEmptyTrash = () => {
    if (trashedNotesCount === 0) {
      setMessage('Trash is already empty');
      setMessageType('info');
      return;
    }
    setShowEmptyTrashDialog(true);
  };

  const confirmEmptyTrash = async () => {
    try {
      await emptyTrash();
      setMessage('Trash emptied successfully');
      setMessageType('success');
      setShowEmptyTrashDialog(false);
    } catch (error: any) {
      setMessage(error.message || 'Failed to empty trash');
      setMessageType('error');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  };

  const renderTrashNote = ({ item }: { item: Note }) => (
    <ModernCard 
      style={styles.noteCard}
      variant="outlined"
      padding="md"
    >
      <View style={styles.noteHeader}>
        <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
          Deleted: {formatDate(item.lastModified)}
        </Text>
      </View>
      
      {item.content && (
        <Text 
          style={[styles.noteContent, { color: colors.textSecondary }]} 
          numberOfLines={2}
        >
          {item.content}
        </Text>
      )}

      <View style={styles.noteActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.restoreButton]}
          onPress={() => handleRestore(item)}
        >
          <Ionicons name="arrow-undo" size={16} color="#4CAF50" />
          <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>
            Restore
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handlePermanentDelete(item)}
        >
          <Ionicons name="trash" size={16} color="#f44336" />
          <Text style={[styles.actionButtonText, { color: '#f44336' }]}>
            Delete Forever
          </Text>
        </TouchableOpacity>
      </View>
    </ModernCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="trash-outline" 
        size={64} 
        color={colors.textSecondary} 
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {localSearchKeyword.trim() ? 'No matching notes in trash' : 'Trash is empty'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {localSearchKeyword.trim() 
          ? 'Try adjusting your search terms'
          : 'Deleted notes will appear here'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with title and search */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.spacer} />
          <View style={styles.titleGroup}>
            <Ionicons name="trash" size={28} color={colors.primary} />
            <Text style={[styles.screenTitle, { color: colors.text }]}>
              Trash
            </Text>
          </View>
        </View>

        {/* Empty Trash Button */}
        {trashedNotesCount > 0 && (
          <View style={styles.emptyTrashHeaderContainer}>
            <ModernButton
              title={`Empty Trash (${trashedNotesCount})`}
              onPress={handleEmptyTrash}
              variant="outline"
              style={styles.emptyTrashButton}
              textStyle={{ color: '#f44336', fontSize: 14 }}
              leftIcon={<Ionicons name="trash" size={16} color="#f44336" />}
            />
          </View>
        )}

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.textSecondary} 
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search trashed notes..."
            placeholderTextColor={colors.textSecondary}
            value={localSearchKeyword}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {localSearchKeyword.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {trashLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading trashed notes...
            </Text>
          </View>
        ) : displayedNotes.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={displayedNotes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTrashNote}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>

      {/* Message Box */}
      <MessageBox
        message={message}
        type={messageType}
        duration={3000}
      />

      {/* Empty Trash Dialog */}
      <ModernDialog
        visible={showEmptyTrashDialog}
        title="Empty Trash?"
        message={`This will permanently delete all ${trashedNotesCount} ${trashedNotesCount === 1 ? 'note' : 'notes'} in trash. This action cannot be undone.`}
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowEmptyTrashDialog(false),
          },
          {
            text: 'Empty Trash',
            style: 'destructive',
            onPress: confirmEmptyTrash,
          },
        ]}
        onClose={() => setShowEmptyTrashDialog(false)}
      />

      {/* Permanent Delete Dialog */}
      <ModernDialog
        visible={showDeleteDialog}
        title="Delete Forever?"
        message={`This will permanently delete "${noteToDelete?.title}". This action cannot be undone.`}
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setShowDeleteDialog(false);
              setNoteToDelete(null);
            },
          },
          {
            text: 'Delete Forever',
            style: 'destructive',
            onPress: confirmPermanentDelete,
          },
        ]}
        onClose={() => {
          setShowDeleteDialog(false);
          setNoteToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  spacer: {
    flex: 1,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  emptyTrashHeaderContainer: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding to prevent content from being hidden behind tab bar
  },
  noteCard: {
    marginBottom: 12,
  },
  noteHeader: {
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 0.48,
    justifyContent: 'center',
  },
  restoreButton: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  deleteButton: {
    borderColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100, // Extra padding to prevent content from being hidden behind tab bar
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyTrashButton: {
    borderWidth: 2,
    borderColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },
});
