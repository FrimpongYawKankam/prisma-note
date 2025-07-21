import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
    cancelAllNotifications,
    getScheduledNotifications,
    scheduleEventNotifications
} from '../../services/notificationService';
import { Spacing, Typography } from '../../styles/tokens';

export const NotificationTestPanel = () => {
  const { colors } = useTheme();

  const testNotification = async () => {
    try {
      // Create a test event 5 minutes from now
      const testDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      
      const notificationIds = await scheduleEventNotifications(
        testDate,
        "Test Event",
        "This is a test notification!"
      );
      
      Alert.alert(
        'Test Notifications Scheduled',
        `Scheduled ${notificationIds.length} notifications for 5 minutes from now.\n\nYou should see notifications like:\n"Test Event in 24 hours! Are you ready?"`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to schedule test notification: ${error}`);
    }
  };

  const viewScheduledNotifications = async () => {
    try {
      const notifications = await getScheduledNotifications();
      
      if (notifications.length === 0) {
        Alert.alert('No Notifications', 'No scheduled notifications found.');
        return;
      }

      const notificationList = notifications.map((notif: any, index: number) => {
        const trigger = notif.trigger as any;
        const triggerDate = trigger?.value ? new Date(trigger.value).toLocaleString() : 'Unknown time';
        return `${index + 1}. ${notif.content.title}\n   Scheduled: ${triggerDate}`;
      }).join('\n\n');

      Alert.alert(
        `Scheduled Notifications (${notifications.length})`,
        notificationList,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to get notifications: ${error}`);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await cancelAllNotifications();
      Alert.alert('Success', 'All scheduled notifications have been cancelled.');
    } catch (error) {
      Alert.alert('Error', `Failed to cancel notifications: ${error}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        🔔 Notification Testing
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]} 
        onPress={testNotification}
      >
        <Ionicons name="notifications" size={16} color="white" />
        <Text style={styles.buttonText}>Test Notification (5 min)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.secondary }]} 
        onPress={viewScheduledNotifications}
      >
        <Ionicons name="list" size={16} color="white" />
        <Text style={styles.buttonText}>View Scheduled</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.error }]} 
        onPress={clearAllNotifications}
      >
        <Ionicons name="trash" size={16} color="white" />
        <Text style={styles.buttonText}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.base,
    borderRadius: 12,
    marginVertical: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.base,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: 8,
    marginVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  buttonText: {
    color: 'white',
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
});
