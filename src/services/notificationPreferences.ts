import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

export interface NotificationPreferences {
  eventsEnabled: boolean;
  reminderIntervals: {
    twentyFourHours: boolean;
    twelveHours: boolean;
    sixHours: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  eventsEnabled: true,
  reminderIntervals: {
    twentyFourHours: true,
    twelveHours: true,
    sixHours: true,
  },
};

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return { ...defaultPreferences, ...parsed };
    }
    return defaultPreferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return defaultPreferences;
  }
};

export const saveNotificationPreferences = async (preferences: NotificationPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
    console.log('✅ Notification preferences saved');
  } catch (error) {
    console.error('❌ Error saving notification preferences:', error);
    throw error;
  }
};

export const toggleEventNotifications = async (): Promise<boolean> => {
  try {
    const current = await getNotificationPreferences();
    const updated = { ...current, eventsEnabled: !current.eventsEnabled };
    await saveNotificationPreferences(updated);
    return updated.eventsEnabled;
  } catch (error) {
    console.error('❌ Error toggling event notifications:', error);
    throw error;
  }
};
