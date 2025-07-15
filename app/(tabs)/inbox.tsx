import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext'; // ✅ Use your custom theme context

export default function EventsScreen() {
  const [userData, setUserData] = useState({ fullName: '' });
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData({ fullName: parsedUser.fullName || parsedUser.email?.split('@')[0] || '' });
      }
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerText, { color: colors.text }]}>
        Hello, <Text style={{ color: colors.primary }}>{userData.fullName || 'User'}</Text>
      </Text>
      <Text style={[styles.subText, { color: colors.textMuted }]}>
        Manage your upcoming events and reminders
      </Text>

      <View style={styles.eventsBox}>
        <Ionicons
          name="calendar-outline"
          size={64}
          color={colors.textMuted}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: colors.text }]}>No Events Scheduled</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Your calendar is clear. Planned events and reminders will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    marginBottom: 40,
  },
  eventsBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});
