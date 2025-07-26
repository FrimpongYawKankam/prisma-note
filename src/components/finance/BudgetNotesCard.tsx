// 📝 Budget Notes Component
// Display and manage notes associated with budget

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { Note } from '../../types/api';
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';

interface BudgetNotesCardProps {
  notes: Note[];
  onAddNote?: () => void;
  onViewNote?: (noteId: number) => void;
  isLoading?: boolean;
}

export const BudgetNotesCard: React.FC<BudgetNotesCardProps> = ({
  notes,
  onAddNote,
  onViewNote,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const displayedNotes = expanded ? notes : notes.slice(0, 3);
  const hasMoreNotes = notes.length > 3;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleNotePress = (note: Note) => {
    if (onViewNote) {
      onViewNote(note.id);
    } else {
      router.push(`/note-detail?id=${note.id}`);
    }
  };

  const handleAddNote = () => {
    if (onAddNote) {
      onAddNote();
    } else {
      router.push('/add-task');
    }
  };

  return (
    <ModernCard variant="elevated" padding="lg">
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Budget Notes
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNote}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons 
            name="document-outline" 
            size={48} 
            color={colors.textSecondary} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Notes Yet
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Add notes to track your budget goals, spending plans, or financial reminders.
          </Text>
          <ModernButton
            title="Add First Note"
            onPress={handleAddNote}
            variant="primary"
            size="sm"
            leftIcon={<Ionicons name="add" size={16} color="white" />}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <View style={styles.notesList}>
          {displayedNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteItem, { borderBottomColor: colors.border }]}
              onPress={() => handleNotePress(note)}
              activeOpacity={0.7}
            >
              <View style={styles.noteHeader}>
                <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
                  {note.title}
                </Text>
                <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                  {formatDate(note.createdAt)}
                </Text>
              </View>
              
              {note.content && (
                <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={2}>
                  {truncateContent(note.content)}
                </Text>
              )}

              {note.tags && note.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: `${colors.primary}15` }]}
                    >
                      <Text style={[styles.tagText, { color: colors.primary }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                  {note.tags.length > 3 && (
                    <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
                      +{note.tags.length - 3} more
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}

          {hasMoreNotes && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setExpanded(!expanded)}
              activeOpacity={0.7}
            >
              <Text style={[styles.expandText, { color: colors.primary }]}>
                {expanded ? 'Show Less' : `Show ${notes.length - 3} More`}
              </Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
  },
  addButton: {
    padding: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold as any,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.base,
  },
  emptyButton: {
    minWidth: 140,
  },
  notesList: {
    gap: 0,
  },
  noteItem: {
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  noteTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    flex: 1,
    marginRight: Spacing.sm,
  },
  noteDate: {
    fontSize: Typography.fontSize.sm,
  },
  noteContent: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
    marginBottom: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
  },
  moreTagsText: {
    fontSize: Typography.fontSize.xs,
    fontStyle: 'italic',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.xs,
  },
  expandText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
});
