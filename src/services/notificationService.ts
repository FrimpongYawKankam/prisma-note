import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotificationPreferences } from './notificationPreferences';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    let finalStatus: Notifications.PermissionStatus;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
      return false;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('event-reminders', {
        name: 'Event Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#64ffda',
        sound: 'default',
      });
    }

    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
};

// Schedule event notifications (24h, 12h, 6h before)
export const scheduleEventNotifications = async (
  eventDate: Date,
  eventTitle: string,
  eventDescription?: string
): Promise<string[]> => {
  try {
    // Check if notifications are enabled
    const preferences = await getNotificationPreferences();
    if (!preferences.eventsEnabled) {
      console.log('🔕 Event notifications are disabled');
      return [];
    }

    const now = new Date();
    const scheduledIds: string[] = [];
    
    // Define reminder intervals (in milliseconds) with preference checks
    const reminders = [
      { hours: 24, label: '24 hours', enabled: preferences.reminderIntervals.twentyFourHours },
      { hours: 12, label: '12 hours', enabled: preferences.reminderIntervals.twelveHours },
      { hours: 6, label: '6 hours', enabled: preferences.reminderIntervals.sixHours },
    ];

    for (const reminder of reminders) {
      // Skip if this reminder interval is disabled
      if (!reminder.enabled) {
        console.log(`⏭️ Skipping ${reminder.label} reminder - disabled in preferences`);
        continue;
      }

      // Calculate reminder time
      const reminderTime = new Date(eventDate.getTime() - (reminder.hours * 60 * 60 * 1000));
      
      // Skip if reminder time is in the past
      if (reminderTime <= now) {
        console.log(`⏰ Skipping ${reminder.label} reminder - time is in the past`);
        continue;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${eventTitle} in ${reminder.hours} hours!`,
          body: `Are you ready?${eventDescription ? ` ${eventDescription}` : ''}`,
          sound: true,
          data: {
            eventTitle,
            eventDate: eventDate.toISOString(),
            reminderHours: reminder.hours,
          },
        },
        trigger: {
          type: 'date',
          date: reminderTime,
        } as Notifications.DateTriggerInput,
        identifier: `event-reminder-${eventDate.getTime()}-${reminder.hours}h`,
      });

      scheduledIds.push(notificationId);
      console.log(`🔔 Scheduled ${reminder.label} reminder for ${eventTitle} at ${reminderTime.toLocaleString()}`);
    }

    console.log(`✅ Scheduled ${scheduledIds.length} notifications for event: ${eventTitle}`);
    return scheduledIds;
  } catch (error) {
    console.error('❌ Error scheduling notifications:', error);
    throw error;
  }
};

// Cancel all notifications for a specific event
export const cancelEventNotifications = async (eventDate: Date): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const eventTimestamp = eventDate.getTime();
    
    const notificationsToCancel = scheduledNotifications.filter(notification => 
      notification.identifier.includes(`event-reminder-${eventTimestamp}`)
    );

    for (const notification of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      console.log(`🗑️ Cancelled notification: ${notification.identifier}`);
    }

    console.log(`✅ Cancelled ${notificationsToCancel.length} notifications for event`);
  } catch (error) {
    console.error('❌ Error cancelling notifications:', error);
    throw error;
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Cancelled all scheduled notifications');
  } catch (error) {
    console.error('❌ Error cancelling all notifications:', error);
    throw error;
  }
};

// Get all scheduled notifications (for debugging)
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📋 Found ${notifications.length} scheduled notifications`);
    return notifications;
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return [];
  }
};

// Set up notification listeners
export const setupNotificationListeners = () => {
  // Listener for notifications received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('🔔 Notification received in foreground:', notification);
  });

  // Listener for notification taps (when user taps notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 Notification tapped:', response);
    const eventData = response.notification.request.content.data;
    
    // Handle notification tap - you can navigate to event detail here
    if (eventData?.eventTitle) {
      console.log(`📅 User tapped reminder for: ${eventData.eventTitle}`);
      // Example: router.push({ pathname: '/event-detail', params: { ... } });
    }
  });

  return {
    foreground: foregroundSubscription,
    response: responseSubscription,
  };
};

// Clean up listeners
export const removeNotificationListeners = (subscriptions: {
  foreground: Notifications.Subscription;
  response: Notifications.Subscription;
}) => {
  subscriptions.foreground.remove();
  subscriptions.response.remove();
};
