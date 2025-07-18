import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../types/api';
import { useTheme } from '../../context/ThemeContext';
import { formatNoteDate, getNotePreview } from '../../services/noteService';
import { Typography, Spacing } from '../../styles/tokens';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '600' as const,
      color: colors.text,
      flex: 1,
      marginRight: Spacing.sm,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    actionButton: {
      padding: Spacing.xs,
      borderRadius: 6,
    },
    content: {
      fontSize: Typography.fontSize.base,
      color: colors.textSecondary,
      lineHeight: Typography.lineHeight.base,
      marginBottom: Spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMuted,
    },
    ownerText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {note.title}
        </Text>
        {showActions && (
          <View style={styles.actionsContainer}>
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEdit}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash" size={18} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {note.content && (
        <Text style={styles.content} numberOfLines={3}>
          {getNotePreview(note.content, 150)}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {formatNoteDate(note.lastModified)}
        </Text>
        <Text style={styles.ownerText}>
          {note.ownerName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default NoteCard;
