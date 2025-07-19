import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../types/api';
import { useTheme } from '../../context/ThemeContext';
import { formatEventDateTime, formatEventTime, getTagColor } from '../../services/eventService';
import { Typography, Spacing } from '../../styles/tokens';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
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
      borderLeftWidth: 4,
      borderLeftColor: getTagColor(event.tag),
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
    titleContainer: {
      flex: 1,
      marginRight: Spacing.sm,
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    timeInfo: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMuted,
      marginBottom: 2,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    content: {
      marginBottom: Spacing.sm,
    },
    description: {
      fontSize: Typography.fontSize.base,
      color: colors.textMuted,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    tagContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tagDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    tagText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMuted,
      textTransform: 'capitalize' as const,
    },
    dateText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMuted,
    },
    allDayBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: 8,
    },
    allDayText: {
      fontSize: Typography.fontSize.xs,
      color: '#fff',
      fontWeight: '500' as const,
    },
  });

  const getEventPreview = (description: string, maxLength: number = 100): string => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            {event.allDay && (
              <View style={styles.allDayBadge}>
                <Text style={styles.allDayText}>ALL DAY</Text>
              </View>
            )}
          </View>
          <Text style={styles.timeInfo}>
            {event.allDay 
              ? formatEventDateTime(event.startDateTime).split(',')[0] // Just the date part
              : `${formatEventTime(event.startDateTime)} - ${formatEventTime(event.endDateTime)}`
            }
          </Text>
        </View>
        
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

      {event.description && (
        <View style={styles.content}>
          <Text style={styles.description} numberOfLines={3}>
            {getEventPreview(event.description, 150)}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.tagContainer}>
          <View style={[styles.tagDot, { backgroundColor: getTagColor(event.tag) }]} />
          <Text style={styles.tagText}>
            {event.tag.toLowerCase()}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {formatEventDateTime(event.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;
