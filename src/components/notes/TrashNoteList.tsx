import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../types/api';
import { useNotes } from '../../context/NotesContext';
import TrashNoteCard from './TrashNoteCard';
import { useTheme } from '../../context/ThemeContext';

interface TrashNoteListProps {
  searchKeyword?: string;
}

export const TrashNoteList: React.FC<TrashNoteListProps> = ({ searchKeyword }) => {
  const { colors } = useTheme();
  const {
    trashedNotes,
    trashLoading,
    trashError,
    trashedNotesCount,
    trashSearchResults,
    isSearchingTrash,
    fetchTrashedNotes,
    emptyTrash,
    clearTrashError,
  } = useNotes();

  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

  useEffect(() => {
    fetchTrashedNotes();
  }, []);

  const displayedNotes = searchKeyword && searchKeyword.trim() 
    ? trashSearchResults 
    : trashedNotes;

  const isLoading = trashLoading || isSearchingTrash;

  const handleEmptyTrash = () => {
    if (trashedNotesCount === 0) {
      Alert.alert('Empty Trash', 'Trash is already empty.');
      return;
    }

    Alert.alert(
      'Empty Trash',
      `This will permanently delete all ${trashedNotesCount} notes in trash. This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Empty Trash',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsEmptyingTrash(true);
              await emptyTrash();
              Alert.alert('Success', 'Trash has been emptied.');
            } catch (error) {
              console.error('Failed to empty trash:', error);
              Alert.alert('Error', 'Failed to empty trash. Please try again.');
            } finally {
              setIsEmptyingTrash(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    clearTrashError();
    fetchTrashedNotes();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Trash
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {searchKeyword && searchKeyword.trim() 
            ? `${displayedNotes.length} search results`
            : `${trashedNotesCount} deleted notes`
          }
        </Text>
      </View>

      {trashedNotesCount > 0 && (
        <TouchableOpacity
          style={[styles.emptyTrashButton, { backgroundColor: colors.error }]}
          onPress={handleEmptyTrash}
          disabled={isEmptyingTrash}
        >
          <Ionicons 
            name={isEmptyingTrash ? "refresh" : "trash"} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.emptyTrashText}>
            {isEmptyingTrash ? 'Emptying...' : 'Empty Trash'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trash-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchKeyword && searchKeyword.trim() 
          ? 'No results found'
          : 'Trash is empty'
        }
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchKeyword && searchKeyword.trim()
          ? 'Try searching with different keywords'
          : 'Deleted notes will appear here'
        }
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={48} color={colors.error} />
      <Text style={[styles.errorTitle, { color: colors.error }]}>
        Failed to load trashed notes
      </Text>
      <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
        {trashError}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={handleRefresh}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TrashNoteCard
      note={item}
      onRestore={() => {
        // Note will be removed from list automatically via context state management
      }}
      onPermanentDelete={() => {
        // Note will be removed from list automatically via context state management
      }}
    />
  );

  if (trashError && displayedNotes.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderError()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedNotes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => `trash-note-${item.id}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {isSearchingTrash ? 'Searching...' : 'Loading trashed notes...'}
            </Text>
          </View>
        ) : renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyTrashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyTrashText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default TrashNoteList;
