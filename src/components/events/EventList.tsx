import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Event } from '../../types/api';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../styles/tokens';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  loading?: boolean;
  onRefresh?: () => void;
  onEventPress: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (event: Event) => void;
  showActions?: boolean;
  emptyMessage?: string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  loading = false,
  onRefresh,
  onEventPress,
  onEventEdit,
  onEventDelete,
  showActions = true,
  emptyMessage = 'No events found',
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

  const renderEventItem = ({ item: event }: { item: Event }) => (
    <EventCard
      event={event}
      onPress={() => onEventPress(event)}
      onEdit={onEventEdit ? () => onEventEdit(event) : undefined}
      onDelete={onEventDelete ? () => onEventDelete(event) : undefined}
      showActions={showActions}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  const keyExtractor = (item: Event) => item.id.toString();

  const ItemSeparatorComponent = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.contentContainer,
          events.length === 0 && { flex: 1 }
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
          length: 140, // Approximate height of an event card
          offset: 140 * index,
          index,
        })}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

export default EventList;
