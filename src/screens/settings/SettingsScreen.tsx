import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { getNotificationPreferences, toggleEventNotifications } from '../../services/notificationPreferences';
import { safeNavigateBack } from '../../utils/navigation';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, colors, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load notification preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferences = await getNotificationPreferences();
        setNotificationsEnabled(preferences.eventsEnabled);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleNotificationToggle = async () => {
    try {
      const newState = await toggleEventNotifications();
      setNotificationsEnabled(newState);
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#fefefe' }]}>
      {/* Header with Back Button and Title */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeNavigateBack('/')}>
          <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Shortcut */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]} 
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.rowText, { color: isDark ? '#fff' : '#000' }]}>
              Profile
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Appearance
          </Text>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]} 
            onPress={toggleTheme}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="moon-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.rowText, { color: isDark ? '#fff' : '#000' }]}>
              {theme === 'dark' ? 'Dark Mode (On)' : 'Dark Mode (Off)'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Language
          </Text>
          <TouchableOpacity
            style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
            onPress={() => router.push('/language')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.rowText, { color: isDark ? '#fff' : '#000' }]}>
              English
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Notifications
          </Text>
          <View style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.rowText, { color: isDark ? '#fff' : '#000' }]}>
              Event Reminders
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: isDark ? '#333' : '#ddd', true: colors.primary + '40' }}
              thumbColor={notificationsEnabled ? colors.primary : (isDark ? '#666' : '#fff')}
              ios_backgroundColor={isDark ? '#333' : '#ddd'}
            />
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? '#888' : '#666' }]}>
            Get notified 24h, 12h, and 6h before your events
          </Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Account
          </Text>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]} 
            onPress={() => router.push('/change-password')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="key-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.rowText, { color: isDark ? '#fff' : '#000' }]}>
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
          </TouchableOpacity>
        </View>

        {/* Other Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Other
          </Text>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]} 
            onPress={() => router.push('/help')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.rowText, { color: isDark ? '#fff' : '#000' }]}>
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} style={styles.arrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    lineHeight: 30,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '500',
    lineHeight: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 'auto',
  },
});
