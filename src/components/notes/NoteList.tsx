import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Note } from '../../types/api';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../styles/tokens';
import NoteCard from './NoteCard';

interface NoteListProps {
  notes: Note[];
  loading?: boolean;
  onRefresh?: () => void;
  onNotePress: (note: Note) => void;
  onNoteEdit?: (note: Note) => void;
  onNoteDelete?: (note: Note) => void;
  showActions?: boolean;
  emptyMessage?: string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  loading = false,
  onRefresh,
  onNotePress,
  onNoteEdit,
  onNoteDelete,
  showActions = true,
  emptyMessage = 'No notes found',
  ListHeaderComponent,
  ListFooterComponent,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: Spacing.base,
      paddingBottom: Spacing['2xl'],
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: Spacing['4xl'],
    },
    emptyText: {
      fontSize: Typography.fontSize.lg,
      color: colors.textMuted,
      textAlign: 'center',
    },
    separator: {
      height: Spacing.sm,
    },
  });

  const renderNoteItem = ({ item: note }: { item: Note }) => (
    <NoteCard
      note={note}
      onPress={() => onNotePress(note)}
      onEdit={onNoteEdit ? () => onNoteEdit(note) : undefined}
      onDelete={onNoteDelete ? () => onNoteDelete(note) : undefined}
      showActions={showActions}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  const keyExtractor = (item: Note) => item.id.toString();

  const ItemSeparatorComponent = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.contentContainer,
          notes.length === 0 && { flex: 1 }
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate height of a note card
          offset: 120 * index,
          index,
        })}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

export default NoteList;
